// /Users/julianteh/julwrites/cash-register/server/api/categories/categories-db.ts

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const databasePath = path.join(process.cwd(), 'data', 'categories.sqlite');

const db = await open({
  filename: databasePath,
  driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`);

export default db;
