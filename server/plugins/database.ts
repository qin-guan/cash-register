import { drizzle as betterSqlite3Drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate as betterSqlite3Migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { isProduction } from 'std-env'

import Database from 'better-sqlite3'

export default defineNitroPlugin(async () => {
  if (isProduction) // Migration should not run in production
    return

  const db = betterSqlite3Drizzle(new Database(useRuntimeConfig().dev.sqliteFileName))
  betterSqlite3Migrate(db, { migrationsFolder: './server/drizzle' })
})
