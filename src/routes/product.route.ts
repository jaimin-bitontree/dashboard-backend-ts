import { Router } from "express";
import { getProducts } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth";

const router= Router()
router.get('/products',authMiddleware,getProducts)

export default router