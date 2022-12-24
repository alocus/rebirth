<script setup>
import { VueFlow, useVueFlow } from '@braks/vue-flow';
import { computed } from 'vue';
// import useStore from './stores/ElementsStore.ts';

const store = useElementStore();

const { onConnect, addEdges } = useVueFlow();

onConnect((params) => addEdges([params]));
</script>

<template>
  <VueFlow v-model="store.elements" :fit-view-on-init="true">
    <div style="position: absolute; right: 10px; top: 10px; z-index: 4">
      <button style="margin-right: 5px" @click="store.updatePosition">
        update positions
      </button>
      <button style="margin-right: 5px" @click="store.toggleClass">
        toggle class
      </button>
      <button @click="store.log">log store state</button>
    </div>
  </VueFlow>
</template>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
