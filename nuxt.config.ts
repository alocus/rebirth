// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // https://v3.nuxtjs.org/api/configuration/nuxt.config
  css: [
    'vuetify/lib/styles/main.sass'
  ],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },


  imports: {
    dirs: ['stores'],
  },
  modules: [
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
      },
    ],
  ],

})

