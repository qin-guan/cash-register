import type { H3Event } from 'h3'
import { lucia as _lucia } from 'lucia'
import { h3 } from 'lucia/middleware'
import { betterSqlite3, d1 } from '@lucia-auth/adapter-sqlite'

import 'lucia/polyfill/node'

export type Lucia = ReturnType<typeof lucia>

const config = {
  user: 'users',
  session: 'user_sessions',
  key: 'user_keys',
}

declare module 'h3' {
  interface H3EventContext {
    auth: Lucia
  }
}

function lucia(event: H3Event) {
  return _lucia({
    adapter: event.context.rawDatabase.cloudflare
      ? d1(event.context.rawDatabase.connection, config)
      : betterSqlite3(event.context.rawDatabase.connection, config),

    env: event.context.rawDatabase.cloudflare ? 'PROD' : 'DEV',
    middleware: h3(),

    getUserAttributes: data => ({
      username: data.username,
    }),
  })
}

export default defineEventHandler((event) => {
  event.context.auth = lucia(event)
})
