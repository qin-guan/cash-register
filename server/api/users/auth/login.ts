// server/api/users/auth/login.ts
import { defineEventHandler, createError, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { initializeDatabase, User } from '../users-db';
import bcrypt from 'bcrypt';

const secretKey = process.env.AUTH_SECRET;

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]) as User;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  if (!user.is_approved) {
    throw createError({ statusCode: 403, statusMessage: 'Account not approved by admin' });
  }

  if (user.needs_password_reset) {
    return {
      needsPasswordReset: true,
      userId: user.id,
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  const token = jwt.sign({ 
    userId: user.id, 
    username: user.username, 
    isAdmin: user.is_admin 
  }, secretKey, { expiresIn: '1h' });

  return { token, user: { id: user.id, username: user.username, isAdmin: user.is_admin } };
});
