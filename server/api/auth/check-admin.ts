// server/api/auth/check-admin.ts

import { defineEventHandler, createError } from 'h3'
import jwt from 'jsonwebtoken'

const secretKey = process.env.AUTH_SECRET;

export default defineEventHandler(async (event) => {
  const token = event.req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const decoded = jwt.verify(token, secretKey) as any
    return { isAdmin: decoded.isAdmin || false }
  } catch (error) {
    console.error('Check admin error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }
})
