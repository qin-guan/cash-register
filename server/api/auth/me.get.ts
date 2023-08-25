export default defineEventHandler(async (event) => {
  const authRequest = event.context.auth.handleRequest(event)
  const session = await authRequest.validate()
  return { session }
})
