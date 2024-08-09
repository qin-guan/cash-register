// server/api/admin/deleteUser.ts

import { defineEventHandler, readBody, createError } from 'h3'
import { Database } from 'duckdb-async'
import jwt from 'jsonwebtoken'

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

    // Remove user
    const { userId } = JSON.parse(await readBody(event))
    console.log(userId);
    await db.run('DELETE FROM users WHERE id = ?', userId)
    return { success: true }
  } catch (error) {
    console.error('Delete User API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
