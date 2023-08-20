import { users } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  return await event.context.database.select().from(users).all()
});
