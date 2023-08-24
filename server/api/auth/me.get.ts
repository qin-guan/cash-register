export default defineEventHandler(async (event) => {
  const authRequest = event.context.auth.handleRequest(event)
  const user = await authRequest.validate()
  return { user }
})
