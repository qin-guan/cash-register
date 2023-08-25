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

export default defineEventHandler((event) => {
  console.log('database registered')
  if (event.context.cloudflare) {
    event.context.database = drizzleD1(event.context.cloudflare.env.DATABASE)
    event.context.rawDatabase = {
      cloudflare: true,
      connection: event.context.cloudflare.env.DATABASE,
    }
  }
  else {
    // The database instance is recreated on every request to simulate the actual Cloudflare Workers environment, this may or may not be a bad idea
    const sqlite = new Database(useRuntimeConfig().dev.sqliteFileName)
    event.context.database = drizzleSqlite(sqlite)
    event.context.rawDatabase = {
      cloudflare: false,
      connection: sqlite,
    }
  }
})
