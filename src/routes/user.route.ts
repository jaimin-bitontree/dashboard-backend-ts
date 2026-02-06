import { Router } from "express"
const router:Router = Router()
import { login, resetPassword, signup } from "../controllers/auth.controller"
import { validateLogin, validateResetPassword, validateSignup } from "../middlewares/authValidation"
import { authMiddleware } from "../middlewares/auth"

router.post('/signup',validateSignup,signup)
router.post('/login',validateLogin,login)
router.put('/reset-password',validateResetPassword,authMiddleware,resetPassword)

export default router

