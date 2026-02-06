import bcrypt from 'bcrypt'
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken'
import { AuthPayload } from '../types/auth'

export const generateHash = async (password: string): Promise<string> => {
  const salt = Number(process.env.SALT)
  if (!salt) {
    throw new Error('salt round is not defined')
  }
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (
  password: string,
  userPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, userPassword)
}

export const generateToken = (
  payload: Record<string, any>,
  expiresIn: SignOptions['expiresIn'],
  secret: Secret
): string => {
  return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload
}
