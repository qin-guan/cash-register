import { defineEventHandler, readBody, createError } from 'h3';
import jwt from 'jsonwebtoken';
import { initializeDatabase, User, secretKey } from '../users-db';

export default defineEventHandler(async (event) => {
  try {
    const { newUsername, newPassword } = await readBody(event);
    const authHeader = event.req.headers.authorization;

    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey) as { userId: number };

    const db = await initializeDatabase();

    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.userId) as User;
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    let result;
    if (newUsername === user.username) {
      result = await db.run(`
        UPDATE users
        SET password = COALESCE(?, password)
        WHERE id = ?
      `, newPassword || user.password, decoded.userId);
    } else {
      result = await db.run(`
        UPDATE users
        SET username = COALESCE(?, username),
            password = COALESCE(?, password)
        WHERE id = ?
      `, newUsername || user.username, newPassword || user.password, decoded.userId);
    }

    if (result.changes === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No changes were made'
      });
    }

    return { message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Update settings error:', error);
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      stack: error.stack
    });
  }
});
