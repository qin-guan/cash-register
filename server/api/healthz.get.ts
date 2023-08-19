import { users } from '~/server/db/schema'

export default defineEventHandler(() => eventHandler(async (event) => {
  return await event.context.database.select().from(users).all()
}))
