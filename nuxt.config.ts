// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // https://github.com/CodyBontecou/nuxt3-and-vuetify/blob/main/nuxt.config.ts
  css: ["vuetify/lib/styles/main.sass", "@mdi/font/css/materialdesignicons.min.css"],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },

  // Auto import stores dir and pinia
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

