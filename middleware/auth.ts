export default defineNuxtRouteMiddleware(async (to) => {
  const { $client } = useNuxtApp()
  const { data } = await $client.auth.me.useQuery()

  if (to.path === '/login') {
    if (data.value?.session)
      return navigateTo('/')
  }
})
