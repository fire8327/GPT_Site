// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@formkit/nuxt',
    '@nuxtjs/supabase',
    '@hypernym/nuxt-anime'
  ],
  supabase: {
    redirect: false
  },
  css: ['@/assets/css/tailwind.css'],
  runtimeConfig: {
    openRouterApiKey: process.env.OPEN_ROUTER_API_KEY,
  },
})