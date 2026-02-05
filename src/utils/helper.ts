import bcrypt from 'bcrypt'
import { error } from 'node:console'

export const generateHash = async (password: string): Promise<string> => {
  const salt = Number(process.env.SALT)
  if (!salt) {
    throw new Error('salt round is not defined')
  }
  return bcrypt.hash(password, salt)
}
