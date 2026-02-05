import pool from '../config/db'

export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ])
  return result.rows[0] || null
}

export const findUserById = async (id: number) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}
export const createUser = async (data: any) => {
  const result = await pool.query(
    'insert into users(name,email,password) values ($1,$2,$3) ',
    [data.name, data.email, data.password]
  )
  return result.rows[0] || null
}
