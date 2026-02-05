import express, { Application } from 'express'
import cors from 'cors'
import userRoutes from './routes/user.route'
const app:Application = express()
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))
app.use(express.json())
app.use('/v1/auth',userRoutes)
export default app