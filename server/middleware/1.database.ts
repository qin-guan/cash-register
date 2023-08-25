import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import type { Database as DatabaseType } from 'better-sqlite3'
import Database from 'better-sqlite3'

type RawDatabase = {
  cloudflare: false
  connection: DatabaseType
} | {
  cloudflare: true
  connection: D1Database
}

declare module 'h3' {
  interface H3EventContext {
    database: DrizzleD1Database | BetterSQLite3Database
    // Expose raw database for auth middleware to use
    rawDatabase: RawDatabase
  }
}

// Need to keep local copy of database instances because
// requests sent during SSR do not have a copy of the
// Cloudflare request context
let database: DrizzleD1Database | BetterSQLite3Database
let rawDatabase: RawDatabase

export default defineEventHandler((event) => {
  if (database) {
    event.context.database = database
    event.context.rawDatabase = rawDatabase
  }
  else {
    if (event.context.cloudflare) {
      database = event.context.database = drizzleD1(event.context.cloudflare.env.DATABASE)
      rawDatabase = event.context.rawDatabase = {
        cloudflare: true,
        connection: event.context.cloudflare.env.DATABASE,
      }
    }
    else {
      const sqlite = new Database(useRuntimeConfig().dev.sqliteFileName)
      database = event.context.database = drizzleSqlite(sqlite)
      rawDatabase = event.context.rawDatabase = {
        cloudflare: false,
        connection: sqlite,
      }
    }
  }
})
