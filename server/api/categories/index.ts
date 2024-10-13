// /Users/julianteh/julwrites/cash-register/server/api/categories/index.ts

import { defineEventHandler, readBody, createError } from 'h3';
import db from './categories-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    const categories = await db.all("SELECT * FROM categories");
    return categories;
  }

  if (method === 'POST') {
    const newCategory = await readBody(event);

    if (!newCategory.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category name is required',
      });
    }

    const result = await db.run("INSERT INTO categories (name) VALUES (?)", newCategory.name);
    const addedCategory = await db.get("SELECT * FROM categories WHERE id = ?", result.lastID);

    return addedCategory;
  }
});
