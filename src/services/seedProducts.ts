import pool from '../config/db'
import path from 'node:path'
import fs from 'fs'
export type Product = {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}
export const seedProduct = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY,
        title TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        image TEXT,
        rating_rate NUMERIC(2,1),
        rating_count INT
      )
    `)
    console.log('table created')

    const filePath = path.join(__dirname, '../data/product.json')
    const jsonData = fs.readFileSync(filePath, 'utf-8')
    const products: Product[] = JSON.parse(jsonData)

    for (const product of products) {
      await pool.query(
        `
        INSERT INTO products
        (id, title, price, description, category, image, rating_rate, rating_count)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          product.id,
          product.title,
          product.price,
          product.description,
          product.category,
          product.image,
          product.rating.rate,
          product.rating.count,
        ]
      )
    }

    console.log(' Products seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}
seedProduct()
