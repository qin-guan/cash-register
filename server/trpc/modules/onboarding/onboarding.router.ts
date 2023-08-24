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
})
