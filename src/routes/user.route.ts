import { Router } from "express"
const router:Router = Router()
import { forgotPassword, login, resetPassword, sendEmail, signup } from "../controllers/auth.controller"
import { validateEmail, validateForgotPassword, validateLogin, validateResetPassword, validateSignup } from "../middlewares/authValidation"
import { authMiddleware } from "../middlewares/auth"

router.post('/signup',validateSignup,signup)
router.post('/login',validateLogin,login)
router.put('/reset-password',validateResetPassword,authMiddleware,resetPassword)
router.post('/send-Email',validateEmail,sendEmail)
router.put('/forgot-password',validateForgotPassword,forgotPassword)

export default router

