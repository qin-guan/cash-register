// /Users/julianteh/julwrites/cash-register/server/api/expenses/index.ts

import { Database } from 'duckdb-async';
import { defineEventHandler, readBody } from 'h3';
import { existsSync } from 'fs';

// Define the Expense interface
interface Expense {
  id?: number;
  amount: number;
  description: string;
  date: string;
  category: string;
}

// Initialize DuckDB connection
const db = await Database.create(':memory:');
await db.connect();

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

// Load data from CSV file if it exists
if (existsSync('expenses.csv')) {
  await db.exec("COPY expenses FROM 'expenses.csv' (HEADER, DELIMITER ',')");
} else {
  console.log("No existing CSV file found. Starting with empty table.");
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // GET: Fetch all expenses
  if (method === 'GET') {
    const expenses = await db.all("SELECT * FROM expenses") as Expense[];
    return expenses;
  }

  // POST: Add a new expense
  if (method === 'POST') {
    const expense: Expense = await readBody(event);
    
    console.log('Received expense:', expense);
  
    // Ensure all required fields are present
    if (!expense.amount || !expense.description || !expense.date || !expense.category) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      });
    }
  
    try {
      // Get the next ID by finding the maximum ID and adding 1
      const maxIdResult = await db.all("SELECT COALESCE(MAX(id), 0) as max_id FROM expenses");
      const nextId = maxIdResult[0].max_id + 1;
      
      const result = await db.run(`
        INSERT INTO expenses (id, amount, description, date, category)
        VALUES (?, ?, ?, ?, ?)
      `, nextId, expense.amount, expense.description, expense.date, expense.category);
      
      await db.exec("COPY expenses TO 'expenses.csv' (HEADER, DELIMITER ',')");
      
      return { id: nextId, ...expense };
    } catch (err: unknown) {
      console.error('Error inserting expense:', err);
      return createError({
        statusCode: 500,
        statusMessage: 'Error inserting expense: ' + getErrorMessage(err),
      });
    }
  }

  // Utility function to get error message
  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
});
