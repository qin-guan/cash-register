/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */

import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import type { Context } from './context'
import type { Meta } from './meta'

const t = initTRPC
  .meta<Meta>()
  .context<Context>()
  .create({
    transformer: superjson,
  })

const authMiddleware = t.middleware(async ({ next, ctx }) => {
  const session = await ctx.authRequest.validate()
  if (!session)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  const res = await ctx.database.select().from(users).where(eq(users.username, session.user.username))
  if (res.length === 0)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      user: res[0],
    },
  })
})

/**
 * Unprotected procedure
 */
export const publicProcedure = t.procedure

/**
 * Create a protected procedure
 */
export const protectedProcedure = t.procedure
  .use(authMiddleware)

export const router = t.router
export const middleware = t.middleware
