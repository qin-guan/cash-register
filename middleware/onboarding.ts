// For simplicity sake, just block navigation until this resolves.
// Should not be a big matter since onboarding only runs once and
// users should not go back to this page again.
export default defineNuxtRouteMiddleware(async (to) => {
  const { $client } = useNuxtApp()
  const { data: status } = await $client.onboarding.status.useQuery()
  const { data: me } = await $client.auth.me.useQuery()

  if (to.path === '/') {
    if (!status.value?.completed)
      return navigateTo('/onboarding')
    if (!me.value?.session)
      return navigateTo('/login')
  }

  if (to.path === '/onboarding') {
    if (status.value?.completed)
      return navigateTo('/')
  }

  if (to.path === '/login') {
    if (!status.value?.completed)
      return navigateTo('/onboarding')
    if (me.value?.session)
      return navigateTo('/')
  }
})
