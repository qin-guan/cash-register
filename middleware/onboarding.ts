// For simplicity sake, just block navigation until this resolves.
// Should not be a big matter since onboarding only runs once and
// users should not go back to this page again.
export default defineNuxtRouteMiddleware(async (to) => {
  const { $client } = useNuxtApp()
  const { data } = await $client.onboarding.status.useQuery()

  if (to.path === '/') {
    if (!data.value?.completed)
      return navigateTo('/onboarding')
  }

  if (to.path === '/onboarding') {
    if (data.value?.completed)
      return navigateTo('/')
  }
})
