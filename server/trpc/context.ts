import type { Logger } from 'pino'
import type { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import type { Storage } from 'unstorage'
import type { AppConfig } from 'nuxt/schema'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { AuthRequest, Session } from 'lucia'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions {
  logger: Logger

  // Cache
  cache: {
    users: Storage
  }

  // Static configuration that should be provided through AppConfig
  config: AppConfig

  // Database
  database: DrizzleD1Database | BetterSQLite3Database

  // Auth
  auth: Omit<Lucia.Auth, 'handleRequest'>
  authRequest: AuthRequest<Lucia.Auth>
}

/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Most things should be passed in through H3 event context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createServerSideHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export function createContextInner(opts: CreateInnerContextOptions) {
  return opts
}

/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(_event: H3Event) {
  const contextInner = createContextInner({
    logger: _event.context.logger,
    cache: _event.context.cache,
    config: useAppConfig(),
    database: _event.context.database,
    auth: _event.context.auth,
    authRequest: _event.context.auth.handleRequest(_event),
  })

  console.log("test", contextInner)

  return {
    ...contextInner,
    // Other outer context values as needed
  }
}

export type Context = inferAsyncReturnType<typeof createContextInner>
