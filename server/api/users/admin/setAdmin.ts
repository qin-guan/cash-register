// server/api/admin/setAdmin.ts

import { defineEventHandler, readBody, createError } from 'h3';
import jwt from 'jsonwebtoken';
import db, { User, secretKey } from '../users-db';

export default defineEventHandler(async (event) => {
  const token = event.req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as any;
    if (!decoded.isAdmin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    const { userId, is_admin } = await readBody(event);

    await db.run(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      is_admin,
      userId
    );

    const updatedUser = await db.all('SELECT id, username, is_admin, is_approved FROM users WHERE id = ?', userId);
    return updatedUser[0];
  } catch (error) {
    console.error('Update User API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
