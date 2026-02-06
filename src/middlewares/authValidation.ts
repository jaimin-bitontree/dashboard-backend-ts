import { NextFunction, Request, Response } from 'express'
import {
  signupSchema,
  loginSchema,
  resetPasswordSchema,
  checkEmail,
  forgotPasswordSchema,
} from '../utils/validation.schema'
export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = signupSchema.safeParse(req.body)
  console.log(result)

  if (!result.success) {
    console.log(result)
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }
  next()
}

// login middleware

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    console.log(result)
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }
  next()
}

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = resetPasswordSchema.safeParse(req.body)
  if (!result.success) {
    console.log(result)
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }
  next()
}
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = checkEmail.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }
  next()
}
export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = forgotPasswordSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }
  next()
}
