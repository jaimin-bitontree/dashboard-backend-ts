import { Request, Response } from 'express'
import pool from '../config/db'
import bcrypt from 'bcrypt'
import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../services/user.service'
import { comparePassword, generateHash, generateToken } from '../utils/helper'
import { Secret } from 'jsonwebtoken'
import { AuthPayload } from '../types/auth'
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

// login middleware

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body as {
//       email: string
//       password: string
//     }
//     const emailLower = email.toLowerCase()

//     // const isExit = await pool.query('select * from users where email=$1', [
//     //   emailLower,
//     // ]);
//     const user = await findUserByEmail(emailLower)
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' })
//     }
//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) {
//       return res.status(401).json({
//         message: 'The password you entered is incorrect.',
//       })
//     }
//     const payload = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//     }
//     // const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//     //   expiresIn: '30m',
//     // });
//     if (!process.env.JWT_SECRET_KEY) {
//       return res.status(500).json({
//         message: 'JWT secret key is not configured',
//       })
//     }
//     const jwtSecret= process.env.JWT_SECRET_KE
//     const token = generateToken(payload, '30m', jwtSecret)
//     return res.status(200).json({
//       message: 'Login successful',
//       success: true,
//       token,
//       payload,
//     })
//   } catch (error) {
//     console.log('login error :', error)
//     return res.status(500).json({ message: 'error :', error })
//   }
// }
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
    // save new passsword to the user data
    await pool.query('update users set password=$1 where id=$2', [
      hashPassword,
      userId,
    ])
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
