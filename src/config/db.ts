import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password:String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
})

// function to check DB status
export const checkDbConnection = async () => {
  await pool.query('SELECT 1')
}

export default pool
