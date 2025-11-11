// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@formkit/nuxt',
    '@nuxtjs/supabase'
  ],
  supabase: {
    redirect: false
  },
  css: ['@/assets/css/tailwind.css'],
  runtimeConfig: {
    public: {
      // Пример: apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api'
    },
    openRouterApiKey: process.env.OPEN_ROUTER_API_KEY, // Загружаем переменную из окружения
  },
  postcss: {
    plugins: {
      cssnano: false 
    }
  },
  ssr: false,
  nitro: {
    preset: 'netlify'
  }
})