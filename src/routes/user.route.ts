import { Router } from "express"
const router:Router = Router()
import { forgotPassword, login, resetPassword, sendEmail, signup } from "../controllers/auth.controller"
import { validateEmail, validateForgotPassword, validateLogin, validateResetPassword, validateSignup, validateUpdate } from "../middlewares/authValidation"
import { authMiddleware } from "../middlewares/auth"
import { getProfile } from "../controllers/getProfile.controller"
import { profileUpdate } from "../controllers/updateProfile.controller"

router.post('/signup',validateSignup,signup)
router.post('/login',validateLogin,login)
router.put('/reset-password',validateResetPassword,authMiddleware,resetPassword)
router.post('/send-Email',validateEmail,sendEmail)
router.put('/forgot-password',validateForgotPassword,forgotPassword)
router.get('/get-profile',authMiddleware,getProfile)
router.put('/profile-update',validateUpdate,authMiddleware,profileUpdate)

export default router

