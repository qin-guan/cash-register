// login.ts
import { defineEventHandler, readBody, createError } from 'h3';
import jwt from 'jsonwebtoken';
import { initializeDatabase, User, secretKey, adminUsername, adminPassword } from '../users-db';

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);
    const db = await initializeDatabase();

    let user: User | undefined;

    // Check if it's the admin user from environment variables
    if (username === adminUsername && password === adminPassword) {
      user = {
        id: 0,
        username: adminUsername,
        password: adminPassword,
        is_admin: true,
        is_approved: true
      };
    } else {
      const existingUser = await db.get(`SELECT * FROM users WHERE username = ?`, username) as User;
      
      if (existingUser) {
        user = existingUser;
        if (user.password !== password) {
          throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
        }
        if (!user.is_admin && !user.is_approved) {
          throw createError({ statusCode: 403, statusMessage: 'Account not approved by admin' });
        }
      } else {
        throw createError({ statusCode: 401, statusMessage: 'User not found' });
      }
    }

    const token = jwt.sign({ userId: user.id, username: user.username, isAdmin: user.is_admin }, secretKey, { expiresIn: '1h' });
    return { token, isAdmin: user.is_admin };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
});
