import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { LuciaError } from 'lucia'
import { protectedProcedure, publicProcedure, router } from '../../trpc'

export const authRouter = router({
  me: protectedProcedure
    .query(async ({ ctx }) => {
      return { session: await ctx.authRequest.validate() }
    }),

  login: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.auth.useKey(
          'username',
          input.username.toLowerCase(),
          input.password,
        )

        const session = await ctx.auth.createSession({
          userId: user.userId,
          attributes: {},
        })

        ctx.authRequest.setSession(session)
      }
      catch (e) {
        if (
          e instanceof LuciaError
          && (e.message === 'AUTH_INVALID_KEY_ID'
            || e.message === 'AUTH_INVALID_PASSWORD')
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Incorrect username or password',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),
})
