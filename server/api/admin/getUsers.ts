// server/api/admin/getUsers.ts

import { defineEventHandler, createError } from 'h3'
import { Database } from 'duckdb-async'
import jwt from 'jsonwebtoken'
import { User } from '../auth/login'

const secretKey = process.env.AUTH_SECRET
const databasePath = 'data/users.db'

export default defineEventHandler(async (event) => {
  // Verify that the user is an admin
  const token = event.req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const decoded = jwt.verify(token, secretKey) as any
    if (!decoded.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden'
      })
    }

    const db = await Database.create(databasePath)
    await db.connect()

    // List all users
    const users = await db.all('SELECT id, username, is_admin FROM users') as User[]
    return users
  } catch (error) {
    console.error('Get Users API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
