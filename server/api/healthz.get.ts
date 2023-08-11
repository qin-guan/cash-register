import { users } from '~/server/db/schema'

export default defineLazyEventHandler(() => eventHandler(async (event) => {
  return await event.context.database.select().from(users).all()
}))
