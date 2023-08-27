import { users } from '~/server/db/schema'
import { defineEventHandler } from '#imports';

export default defineEventHandler(async (event) => {
  return await event.context.database.select().from(users).all()
});
