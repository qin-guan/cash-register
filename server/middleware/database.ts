import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

import { isCI, isDevelopment } from 'std-env'

declare module 'h3' {
  interface H3EventContext {
    database: DrizzleD1Database | BetterSQLite3Database
  }
}

export default defineEventHandler((event) => {
  if (isDevelopment || isCI) {
    // The database instance is recreated on every request to simulate the actual Cloudflare Workers environment, this may or may not be a bad idea
    const sqlite = new Database(useRuntimeConfig().dev.sqliteFileName)
    event.context.database = drizzleSqlite(sqlite)
  }
  else {
    event.context.database = drizzleD1(event.context.cloudflare.env.DATABASE)
  }
})
