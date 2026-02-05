import { Router } from "express"
const router:Router = Router()
import { signup } from "../controllers/auth.controller"
import { validateSignup } from "../middlewares/authValidation"

router.post('/signup',validateSignup,signup)

export default router

