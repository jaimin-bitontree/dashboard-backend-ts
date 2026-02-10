import { Request, Response } from 'express'
import pool from '../config/db'
import bcrypt from 'bcrypt'
import {
  createUser,
  findUserByEmail,
  findUserById,
  updatePassword,
  updatePasswordWithResetVersion,
} from '../services/user.service'
import {
  comparePassword,
  generateHash,
  generateToken,
  verifyToken,
} from '../utils/helper'
import { Secret } from 'jsonwebtoken'
import { AuthPayload } from '../types/auth'
import nodemailer from 'nodemailer'
import { success } from 'zod'


export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string
      email: string
      password: string
    }
    const isExits = await findUserByEmail(email)
    if (isExits) {
      res.status(409).json({
        message: 'Account already exists. Try logging in instead.',
        success: false,
      })
      return
    }
    const hashPassword = await generateHash(password)
    const payload = {
      name: name,
      email: email,
      password: hashPassword,
    }
    const user = await createUser(payload)
    res
      .status(201)
      .json({ message: 'User created successfully.', success: true, user })
  } catch (error) {
    console.log('signup error: ', error)
    res.status(500).json({
      message: 'Registration failed. Please try again.',
      success: false,
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string
      password: string
    }

    const emailLower = email.toLowerCase()

    const user = await findUserByEmail(emailLower)
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        message: 'The password you entered is incorrect',
      })
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({
        message: 'JWT secret key is not configured',
      })
    }

    const jwtSecret = process.env.JWT_SECRET_KEY

    const payload: AuthPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    }

    const token = generateToken(payload, '30m', jwtSecret)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000, // 30 minutes
    })
    return res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
      user: payload,
    })
  } catch (error) {
    console.error('login error:', error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body as {
      oldPassword: string
      newPassword: string
    }
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }
    const userId = req.user.id
    // check user exits or not
    const user = await findUserById(userId)
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        success: false,
      })
    }
    // get user row from result object
    // check old password is match or not
    const isMatch = await comparePassword(oldPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({
        message: 'old password did not match try again',
        success: false,
      })
    }
    // hashed new password
    const hashPassword = await generateHash(newPassword)
    const isUpdate = await updatePassword(hashPassword,userId)
    if(!isUpdate){
        return res.status(403).json({
        message: 'Password not reset successfully',
      })
    }
    return res.status(200).json({
      message: 'password update successfully',
      success: true,
    })
  } catch (error) {
    console.log('reset passwrod error : ', error)
    return res.status(500).json({
      message: 'internal server error while reseting password',
      success: false,
    })
  }
}

export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as {
      email: string
    }
    const normalizedEmail = email.toLowerCase().trim()

    const result = await pool.query(
      'select id,reset_version from users where email=$1',
      [normalizedEmail]
    )
    if (!result) {
      return res.status(404).json({
        message: 'User not found signup first',
        success: false,
      })
    }
    const user = result.rows[0]
    const payload = {
      userId: user.id,
      createdAt: Date.now(),
      resetVersion: user.reset_version,
    }
    if (!process.env.RESET_PASSWORD_SECRET) {
      return res.status(500).json({
        message: 'JWT secret key is not configured',
      })
    }
    const jwtSecret = process.env.RESET_PASSWORD_SECRET
    const resetToken = generateToken(payload, '30m', jwtSecret)

    const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/${resetToken}`

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    })
    const info = await transporter.sendMail({
      from: '"Dashboard App" <no-reply@dashboard.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below:</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    })
    // console.log('Email preview:', nodemailer.getTestMessageUrl(info))
    return res.status(200).json({
      message: 'We’ve sent you an email.',
      success: true,
      resetToken,
    })
  } catch (error) {
    console.log('error in sending email', error)
    return res.status(500).json({
      message: 'Failed to send email. Please try again.',
      success: false,
    })
  }
}

// this is forgot password controller
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body as {
      token: string
      newPassword: string
    }
    if (!token) {
      return res.status(404).json({
        message: 'Access token not found.',
        success: false,
      })
    }
    if (!process.env.RESET_PASSWORD_SECRET) {
      return res.status(500).json({
        message: 'JWT secret key is not configured',
      })
    }
    const secret = process.env.RESET_PASSWORD_SECRET
    const decode = verifyToken(token, secret)
    const { userId, createdAt, resetVersion } = decode
    const FIFTEEN_MIN = 15 * 60 * 1000
    if (Date.now() - createdAt > FIFTEEN_MIN) {
      return res.status(400).json({
        message: 'Reset token Expired',
        success: false,
      })
    }
    const userResult = await pool.query(
      'select password from users where id=$1',
      [userId]
    )
    if (userResult.rowCount === 0) {
      return res.status(400).json({
        message: 'User not found',
        success: false,
      })
    }
    const isSamePassword = await bcrypt.compare(
      newPassword,
      userResult.rows[0].password
    )
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as the old password',
      })
    }
    const hashPassword = await generateHash(newPassword)
    const isUpdate = await updatePasswordWithResetVersion(
      userId,
      hashPassword,
      resetVersion
    )
    if (!isUpdate) {
      return res.status(403).json({
        message: 'Reset token already used please try agian',
      })
    }
    return res.status(200).json({
      message: 'password reset successfully',
      success: true,
    })
  } catch (error) {
    console.log('error while reset password :', error)

    return res.status(400).json({
      message: 'Invalid or expired  reset token',
    })
  }
}

export const logout = (req:Request,res:Response)=>{
  res.clearCookie('token',{
    httpOnly:true,
    secure:process.env.NODE_ENV ==="production",
    sameSite:'lax'
  })
  return res.status(200).json({
    success:true,
    message:"Logged Out successfully"
  })
}