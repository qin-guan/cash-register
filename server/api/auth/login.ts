// server/api/auth/login.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { Database } from 'duckdb-async';
import jwt from 'jsonwebtoken';
import { existsSync } from 'fs';

const databasePath = 'data/users.db';

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
}

const secretKey = process.env.AUTH_SECRET;

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);

    let db = await Database.create(databasePath);

    await db.connect();

    // Create table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        password VARCHAR(50),
        is_admin BOOLEAN DEFAULT FALSE
      );
    `);

    let user: User | undefined;

    // Check if user exists
    const existingUser = await db.all(`
      SELECT * FROM users WHERE username = ?;
    `, [username]) as User[];

    if (existingUser.length > 0) {
      // User exists, check password
      user = existingUser[0];
      if (user.password !== password) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid credentials'
        });
      }
    } else {
      // User doesn't exist, create new user
      const users = await db.all('SELECT * FROM users');

      // Get the next ID by finding the maximum ID and adding 1
      const maxIdResult = await db.all("SELECT COALESCE(MAX(id), 0) as max_id FROM users");
      const nextId = maxIdResult[0].max_id + 1;
      
      await db.run(`
        INSERT INTO users (id, username, password, is_admin) VALUES (?, ?, ?, ?);
      `, nextId, username, password, users.length === 0);

      user = (await db.all(`
        SELECT * FROM users WHERE username = ?;
      `, [username]) as User[])[0];
    }

    if (user) {
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, username: user.username, isAdmin: user.is_admin }, secretKey, { expiresIn: '1h' });
      return { token, isAdmin: user.is_admin };
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create or retrieve user'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error' 
    });
  }
});
