import express, { Application } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import userRoutes from './routes/user.route'
import productRoutes from './routes/product.route'
const app:Application = express()
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/v1/auth',userRoutes)
app.use('/v1',productRoutes)
export default app