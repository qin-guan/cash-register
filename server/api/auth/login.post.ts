/**
 * This is a normal API route instead of tRPC route because of the extra type overhead of passing the Lucia instace to tRPC context.
 * Since theres almost no need to use this more than once (login screen), it's not worth it to add the extra complexity.
 */

import { LuciaError } from 'lucia'
import { z } from 'zod'

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const result = await bodySchema.safeParseAsync(await readBody(event))
  if (!result.success) {
    throw createError({
      message: result.error.toString(),
      status: 400,
    })
  }

  const { username, password } = result.data

  try {
    const user = await event.context.auth.useKey(
      'username',
      username.toLowerCase(),
      password,
    )

    const session = await event.context.auth.createSession({
      userId: user.userId,
      attributes: {},
    })

    const authRequest = event.context.auth.handleRequest(event)

    authRequest.setSession(session)

    return sendRedirect(event, '/') // redirect to profile page
  }
  catch (e) {
    if (
      e instanceof LuciaError
      && (e.message === 'AUTH_INVALID_KEY_ID'
        || e.message === 'AUTH_INVALID_PASSWORD')
    ) {
      throw createError({
        message: 'Incorrect username or password',
        statusCode: 400,
      })
    }

    throw createError({
      message: 'An unknown error occurred',
      statusCode: 500,
    })
  }
})
