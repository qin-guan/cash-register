import { sql } from 'drizzle-orm'

export default defineLazyEventHandler(() => eventHandler(async (event) => {
  try {
    await event.context.database.run(sql`SELECT 1;`)
    return { ok: true, now: new Date() }
  }
  catch (err) {
    return createError({
      status: 500,
    })
  }
}))
