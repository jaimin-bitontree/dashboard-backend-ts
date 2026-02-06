import { NextFunction, Request, Response } from 'express'

import jwt, { JwtPayload } from 'jsonwebtoken'
import { AuthPayload } from '../types/auth'
require('dotenv').config()

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({
      message: 'token not found',
    })
  }
  if (!process.env.JWT_SECRET_KEY) {
    return res.status(500).json({
      message: 'JWT secret key not configured',
    })
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY) as AuthPayload
    req.user = decode
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'invalid token',
    })
  }
}
