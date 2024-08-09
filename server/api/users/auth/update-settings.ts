import { defineEventHandler, readBody, createError } from 'h3';
import { Statement } from 'duckdb-async'
import jwt from 'jsonwebtoken';
import db, { User, secretKey } from '../users-db';

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

    // Check if user exists
    const users = await db.all('SELECT * FROM users WHERE id = ?', decoded.userId) as User[];
    
    if (users.length === 0) {
      await db.close();
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    var result: Statement;
    if (newUsername === users[0].username) {
      result = await db.run(`
        UPDATE users
        SET password = COALESCE(?, password)
        WHERE id = ?;
      `, newPassword || null, decoded.userId);
    } else {
      result = await db.run(`
        UPDATE users
        SET username = COALESCE(?, username),
            password = COALESCE(?, password)
        WHERE id = ?;
      `, newUsername || null, newPassword || null, decoded.userId);
    }

    await db.close();

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
