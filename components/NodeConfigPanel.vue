<script setup>
import { useVueFlow } from '@vue-flow/core'
import { reactive } from 'vue'

const defaultLabel = '-'
const { onPaneReady, getNode } = useVueFlow()

const opts = reactive({
  bg: '#eeeeee',
  label: 'Node 1',
  hidden: false,
})

const updateNode = () => {
  const node = getNode.value('1')
  node.label = opts.label.trim() !== '' ? opts.label : defaultLabel
  node.style = { backgroundColor: opts.bg }
  node.hidden = opts.hidden
}

onPaneReady(({ fitView }) => {
  fitView()
  updateNode()
})
</script>

<template>
 
    <div class="updatenode__controls">
      <label>label:</label>
      <input v-model="opts.label" @input="updateNode" />

      <label class="updatenode__bglabel">background:</label>
      <input v-model="opts.bg" type="color" @input="updateNode" />

      <div class="updatenode__checkboxwrapper">
        <label>hidden:</label>
        <input v-model="opts.hidden" type="checkbox" @change="updateNode" />
      </div>
    </div>

</template>
<style>
.updatenode__controls{z-index:4;font-size:11px;background-color:#d3d3d3;border-radius:10px;padding:8px}.updatenode__controls label{display:blocK}.updatenode__controls input{padding:2px;border-radius:5px}.updatenode__bglabel{margin-top:8px}.updatenode__checkboxwrapper{display:flex;justify-content:center;align-items:center;margin-top:8px}
</style>
