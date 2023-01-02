<script setup>
import { useVueFlow } from '@vue-flow/core'
import { reactive } from 'vue'

const defaultLabel = '-'
const { onPaneReady, getNode, onNodeClick } = useVueFlow()

const selectedNodeId = ref(null)

const opts = reactive({
  bg: '#eeeeee',
  label: '',
  hidden: false,
})

const updateNode = () => {
  if(!selectedNodeId.value) return

  const node = getNode.value(selectedNodeId.value)
  node.label = opts.label.trim() !== '' ? opts.label : defaultLabel
  node.style = { backgroundColor: opts.bg }
  node.hidden = opts.hidden
}

onNodeClick((nodeMouseEvent) => {
  if(nodeMouseEvent.node) {
    const node = nodeMouseEvent.node
    selectedNodeId.value = node.id

    console.log('node select:' + node.id)
    opts.bg = node.style?.backgroundColor??'#eeeeee'
    opts.label = node.label
    opts.hidden = node.hidden 
  }
})

onPaneReady(({ fitView }) => {
  fitView()
  updateNode()
  selectedNodeId.value = null
})
</script>

<template>
 
    <div v-if="selectedNodeId" class="updatenode__controls">
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
