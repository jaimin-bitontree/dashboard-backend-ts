import { Request, Response } from 'express'
import pool from '../config/db'
import bcrypt from 'bcrypt'
import { createUser, findUserByEmail } from '../services/user.service'
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string
      email: string
      password: string
    }
    const isExits = await findUserByEmail(email)
    if (isExits) {
      res.status(400).json({
        message: 'Account already exists. Try logging in instead.',
        success: false,
      })
      return
    }
    const hashPassword: string = await bcrypt.hash(password, 10)
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
