import express from 'express'
import dotenv from 'dotenv'
import { checkDbConnection } from './config/db'
import app from './app'
dotenv.config()

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // check database
    await checkDbConnection()
    console.log('Database is running')

    // start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Database is NOT running')
    console.error(error)
    process.exit(1)
  }
}

startServer()
