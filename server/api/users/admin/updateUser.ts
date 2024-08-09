// server/api/admin/updateUser.ts

import { defineEventHandler, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'
import db, { User } from '../users-db'

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

    // Update user (promote/demote)
    const { userId, is_admin } = await readBody(event)
    await db.run('UPDATE users SET is_admin = ? WHERE id = ?', is_admin, userId)
    const updatedUser = await db.all('SELECT id, username, is_admin FROM users WHERE id = ?', [userId]) as User[]
    return updatedUser[0]
  } catch (error) {
    console.error('Update User API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
