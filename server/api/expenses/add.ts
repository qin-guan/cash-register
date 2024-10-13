// /Users/julianteh/julwrites/cash-register/server/api/expenses/add.ts

import { defineEventHandler, readBody, createError } from "h3";
import db, { Expense } from "./expenses-db";

export default defineEventHandler(async (event) => {
  const expense: Expense = await readBody(event);

  console.log("Received expense:", expense);

  // Ensure all required fields are present
  if ((!expense.credit && !expense.debit) || !expense.description || !expense.date || !expense.category) {
    return createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  try {
    const result = await db.run(`
      INSERT INTO expenses (credit, debit, description, date, category)
      VALUES (?, ?, ?, ?, ?)
    `, expense.credit || 0, expense.debit || 0, expense.description, expense.date, expense.category);

    return { id: result.lastID, ...expense };
  } catch (err: unknown) {
    console.error("Error inserting expense:", err);
    return createError({
      statusCode: 500,
      statusMessage: "Error inserting expense: " + getErrorMessage(err),
    });
  }
});

// Utility function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
