<template>
  <VLocaleProvider>
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp>
      <NuxtPage />
    </VApp>
  </VLocaleProvider>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

html,
body,
#__nuxt {
  margin: 0;
  height: 100%;
}

#__nuxt {
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
