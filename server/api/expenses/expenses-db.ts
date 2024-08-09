// expenses-db.ts
import { existsSync } from 'fs';
import { Database } from 'duckdb-async';

const databasePath = 'data/expenses.db';
const db = await Database.create(databasePath);
await db.connect();

if (!existsSync(databasePath)) {
  console.log("No existing Expenses Table found. Starting with empty table.");
}

// Create table if not exists
await db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    amount DECIMAL(10, 2),
    description VARCHAR(255),
    date DATE,
    category VARCHAR(50)
  );
`);

// Define the Expense interface
export interface Expense {
  id?: number;
  amount: number;
  description: string;
  date: string;
  category: string;
}

export default db;
