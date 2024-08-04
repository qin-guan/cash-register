// /Users/julianteh/julwrites/cash-register/server/api/expenses/[id].ts

import { Database } from 'duckdb-async';
import { defineEventHandler, readBody, createError } from 'h3';
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
  const id = event.context.params?.id;

  // GET: Fetch a single expense
  if (method === 'GET') {
    const expense = await db.all("SELECT * FROM expenses WHERE id = ?", [id]) as Expense[];
    if (expense.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    return expense[0];
  }

  // PUT: Update an expense
  if (method === 'PUT') {
    const updatedExpense: Expense = await readBody(event);
    await db.run(`
      UPDATE expenses
      SET amount = ?, description = ?, date = ?, category = ?
      WHERE id = ?
    `, [updatedExpense.amount, updatedExpense.description, updatedExpense.date, updatedExpense.category, id]);
    
    // Check if the expense exists after the update
    const updatedResult = await db.all("SELECT * FROM expenses WHERE id = ?", [id]);
    
    if (updatedResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    
    await db.exec("COPY expenses TO 'expenses.csv' (HEADER, DELIMITER ',')");
    return { id: Number(id), ...updatedExpense };
  }

  // DELETE: Delete an expense
  if (method === 'DELETE') {
    await db.run("DELETE FROM expenses WHERE id = ?", [id]);

    // Check if the expense exists after the update
    const updatedResult = await db.all("SELECT * FROM expenses WHERE id = ?", [id]);
    
    if (updatedResult.length > 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense was not deleted correctly',
      });
    }
    
    await db.exec("COPY expenses TO 'expenses.csv' (HEADER, DELIMITER ',')");
    return { message: 'Expense deleted successfully' };
  }
});
