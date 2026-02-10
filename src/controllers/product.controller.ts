import { Request, Response } from 'express'
import pool from '../config/db'

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 8
    const search = (req.query.search as string) || ''
    const category = req.query.category as string | undefined

    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined

    const maxPrice = req.query.maxPrice 
      ? Number(req.query.maxPrice)
      : undefined

    const offset = (page - 1) * limit

    let whereClause = `WHERE title ILIKE $1`
    const values: any[] = [`%${search}%`]
    let paramIndex = 2

    if (category) {
      whereClause += ` AND category = $${paramIndex}`
      values.push(category)
      paramIndex++
    }

    if (minPrice !== undefined) {
      whereClause += ` AND price >= $${paramIndex}`
      values.push(minPrice)
      paramIndex++
    }

    if (maxPrice !== undefined) {
      whereClause += ` AND price <= $${paramIndex}`
      values.push(maxPrice)
      paramIndex++
    }

    const productsQuery = `
      SELECT *
      FROM products
      ${whereClause}
      ORDER BY id
      LIMIT ${limit} OFFSET ${offset}
    `

    const productsResult = await pool.query(productsQuery, values)

    const countQuery = `
      SELECT COUNT(*)
      FROM products
      ${whereClause}
    `

    const countResult = await pool.query(countQuery, values)

    return res.status(200).json({
      success: true,
      page,
      limit,
      total: Number(countResult.rows[0].count),
      products: productsResult.rows,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    })
  }
}
