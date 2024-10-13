// /Users/julianteh/julwrites/cash-register/server/api/categories/[id].ts

import { defineEventHandler, createError, readBody } from 'h3';
import db from './categories-db'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = event.context.params?.id;

  if (method === 'DELETE') {
    const result = await db.run("DELETE FROM categories WHERE id = ?", id);

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    return { message: 'Category deleted successfully' };
  }

  if (method === 'PUT') {
    const updateData = await readBody(event);

    if (!updateData.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category name is required',
      });
    }

    const category = await db.get("SELECT * FROM categories WHERE id = ?", id);

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    // No operation if same name
    if (updateData.name === category.name) {
      return category;
    }

    const result = await db.run(`
      UPDATE categories 
      SET name = ?
      WHERE id = ?
    `, updateData.name, id);

    if (result.changes === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update category',
      });
    }

    const updatedCategory = await db.get("SELECT * FROM categories WHERE id = ?", id);

    return updatedCategory;
  }
});
