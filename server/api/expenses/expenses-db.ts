// /Users/julianteh/julwrites/cash-register/server/api/expenses/expenses-db.ts

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const databasePath = path.join(process.cwd(), 'data', 'expenses.sqlite');

const db = await open({
  filename: databasePath,
  driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    credit DECIMAL(10, 2) DEFAULT 0,
    debit DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    date DATE,
    category TEXT
  );
`);

// Define the Expense interface
export interface Expense {
  id?: number;
  credit?: number;
  debit?: number;
  description: string;
  date: string;
  category: string;
}

export default db;
