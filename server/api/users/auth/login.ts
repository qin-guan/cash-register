// server/api/users/auth/login.ts

import { defineEventHandler, createError, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { initializeDatabase, User } from '../users-db';

const secretKey = process.env.AUTH_SECRET;

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]) as User;

  if (!user) {
    return { userExists: false };
  }

  if (!user.is_approved || !user.password) {
    return {
      userExists: true,
      needsPasswordReset: true,
      userId: user.id,
    };
  }

  if (password && user.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  const token = jwt.sign({ 
    userId: user.id, 
    username: user.username, 
    isAdmin: user.is_admin 
  }, secretKey, { expiresIn: '1h' });

  return { 
    userExists: true,
    token, 
    user: { id: user.id, username: user.username, isAdmin: user.is_admin } 
  };
});
