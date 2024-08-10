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
    const maxIdResult = await db.all("SELECT COALESCE(MAX(id), 0) as max_id FROM categories");
    const nextId = maxIdResult[0].max_id + 1;

    const result = await db.run("INSERT INTO categories (id, name) VALUES (?, ?)", nextId, newCategory.name);
    const [addedCategory] = await db.all("SELECT * FROM categories WHERE id = ?", nextId);

    return addedCategory;
  }
});