// server/api/users/admin/createUser.ts
import { defineEventHandler, createError, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { initializeDatabase, secretKey } from '../users-db';

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

    const { username } = await readBody(event);
    if (!username) {
      throw createError({ statusCode: 400, statusMessage: 'Username is required' });
    }

    const db = await initializeDatabase();

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      throw createError({ statusCode: 409, statusMessage: 'User already exists' });
    }

    // Insert new user without a password
    const result = await db.run(
      'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)', [username, '', false, false]
    );

    const newUser = {
      id: result.lastID,
      username: username,
      is_admin: false,
      is_approved: false,
    };

    // TODO: Send notification to the new user with instructions to set their password

    return newUser;
  } catch (error) {
    console.error('Create User API error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
