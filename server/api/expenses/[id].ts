// /Users/julianteh/julwrites/cash-register/server/api/expenses/[id].ts

import { defineEventHandler, readBody, createError } from 'h3';
import db, { Expense } from './expenses-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = event.context.params?.id;

  // GET: Fetch a single expense
  if (method === 'GET') {
    const expense = await db.get("SELECT * FROM expenses WHERE id = ?", id) as Expense;
    if (!expense) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    return expense;
  }

  // PUT: Update an expense
  if (method === 'PUT') {
    const updatedExpense: Expense = await readBody(event);
    const result = await db.run(`
      UPDATE expenses
      SET credit = ?, debit = ?, description = ?, date = ?, category = ?
      WHERE id = ?
    `, updatedExpense.credit || 0, updatedExpense.debit || 0, updatedExpense.description, updatedExpense.date, updatedExpense.category, id);
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    
    return { id: Number(id), ...updatedExpense };
  }

  // DELETE: Delete an expense
  if (method === 'DELETE') {
    const result = await db.run("DELETE FROM expenses WHERE id = ?", id);

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }

    console.log(`Expense with ID ${id} deleted successfully`);
    
    return { message: 'Expense deleted successfully' };
  }
});
