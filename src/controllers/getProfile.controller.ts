import { Request, Response } from 'express'
import { findUserById } from '../services/user.service'
export const getProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log('user from token', req.user)
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false,
      })
    }
    const userId = req.user.id
    const user = await findUserById(userId)
    if (!user) {
      return res.status(404).json({
        message: 'user not found',
        success: false,
      })
    }
    const payload = {
      email: user.email,
      age: user.age,
      gender: user.gender,
      name: user.name,
    }
    return res.status(200).json({
      message: 'fetch details successfully',
      payload,
      success: true,
    })
  } catch (error) {
    console.log('error in fetch details: ', error)
    return res.status(500).json({
      message: 'internal error while fetch details',
      success: false,
    })
  }
}
