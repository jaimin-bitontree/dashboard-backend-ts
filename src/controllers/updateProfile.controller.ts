import { Request, Response } from 'express'
import { findUserById, updateProfile } from '../services/user.service'

export const profileUpdate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false,
      })
    }
    const userId = req.user.id
    const { name, age, gender } = req.body
    const user = await findUserById(userId)
    if (!user) {
      return res.status(404).json({
        message: 'user not found',
        success: false,
      })
    }

    const isUpdate = await updateProfile(name, age, gender, userId)
    if (!isUpdate) {
      return res.status(403).json({
        message: 'User details not updated try again',
      })
    }
    return res.status(200).json({
      message: 'Profile updated Successfully',
      success: true,
    })
  } catch (error) {
    // console.log('update profile error:', error)
    return res.status(500).json({
      message: 'Internal server error while updating profile',
      success: false,
    })
  }
}
