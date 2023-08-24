// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  modules: [
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxthq/ui',
  ],

  build: {
    transpile: [
      'trpc-nuxt',
    ],
  },

  tailwindcss: {
    exposeConfig: true,
  },

  ui: {
    icons: [
      'tabler',
    ],
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Cash Register',
      short_name: 'CashRegister',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: process.env.VITE_DEV_PWA === 'true',
      type: 'module',
    },
  },

  runtimeConfig: {
    dev: {
      sqliteFileName: 'sqlite.db',
    },
  },

  typescript: {
    strict: true,
  },
})
