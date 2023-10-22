import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../../trpc'
import { users } from '~/server/db/schema'

export const onboardingRouter = router({
  status: publicProcedure
    .query(async ({ ctx }) => {
      const count = await ctx.database.select().from(users).all()
      return {
        completed: count.length > 0,
      }
    }),

  createInitialUser: publicProcedure
    .use(async ({ next, ctx }) => { // Check whether there are 0 users in table
      const count = await ctx.database.select().from(users).all()
      if (count.length > 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
        })
      }
      return next()
    })
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.auth.createUser({
          key: {
            providerId: 'username',
            providerUserId: input.username.toLowerCase(),
            password: input.password,
          },
          attributes: {
            username: input.username,
          },
        })

        const session = await ctx.auth.createSession({
          userId: user.userId,
          attributes: {
          },
        })

        ctx.authRequest.setSession(session)

        return { ok: true }
      }
      catch (e) { console.error(e) }
    }),
})
