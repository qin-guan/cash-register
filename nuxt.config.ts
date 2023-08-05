// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  modules: [
    '@vite-pwa/nuxt',
    '@nuxthq/ui',
  ],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Cash Register',
      short_name: 'CashRegister',
      theme_color: '#ffffff',
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
  },
})
