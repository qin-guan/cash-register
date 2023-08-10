import { users } from '~/server/db/schema'

export default defineLazyEventHandler(() => async (event) => {
  return await event.context.database.select().from(users).all()
})
