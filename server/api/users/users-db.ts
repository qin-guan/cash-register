// users-db.ts
import { existsSync } from 'fs';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const databasePath = path.join(process.cwd(), 'data', 'users.sqlite');
export const secretKey = process.env.AUTH_SECRET;
export const adminUsername = process.env.ADMIN_USERNAME;
export const adminPassword = process.env.ADMIN_PASSWORD;

let db: Database;

export const initializeDatabase = async () => {
  if (!existsSync(databasePath)) {
    console.log("No existing Users Table found. Starting with empty table.");
  }

  db = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE,
      password VARCHAR(50),
      is_admin BOOLEAN DEFAULT FALSE,
      is_approved BOOLEAN DEFAULT TRUE
    );
  `);

  // Check if admin user exists, if not, create it
  const adminUser = await db.get('SELECT * FROM users WHERE username = ?', adminUsername);
  if (!adminUser && adminUsername && adminPassword) {
    await db.run(
      'INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)',
      adminUsername,
      adminPassword,
      true,
      true
    );
    console.log('Admin user created successfully.');
  }

  return db;
};

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
  is_approved: boolean;
}

export default initializeDatabase;
