<script setup>
import { Panel, PanelPosition, VueFlow, isNode, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { ref } from 'vue'
import { initialElements } from './initial-elements.js'
// import { VueFlow, useVueFlow } from '@vue-flow/core'
import { nextTick, watch } from 'vue'
import Sidebar from './Sidebar.vue'

let id = 0
const getId = () => `dndnode_${id++}`

const flowKey = 'nodes-flow'

/**
 * useVueFlow provides all event handlers and store properties
 * You can pass the composable an object that has the same properties as the VueFlow component props
 */
const { setNodes, setEdges, dimensions, onPaneReady, onNodeDragStop, onConnect, addEdges, setTransform, toObject, findNode, nodes, edges, addNodes, viewport, project, vueFlowRef } = useVueFlow({
  nodes: [
    {
      id: '1',
      type: 'input',
      label: 'input node',
      position: { x: 250, y: 25 },
    },
  ],
})


/**
 * Our elements
 */
const elements = ref(initialElements)

const onSave = () => {
  localStorage.setItem(flowKey, JSON.stringify(toObject()))
}

/**
 * Restore graph from localStorage - like an Undo before save
 */
const onRestore = () => {
  const flow = JSON.parse(localStorage.getItem(flowKey))

  if (flow) {
    const [x = 0, y = 0] = flow.position
    setNodes(flow.nodes)
    setEdges(flow.edges)
    setTransform({ x, y, zoom: flow.zoom || 0 })
  }
}


/**
 * This is a Vue Flow event-hook which can be listened to from anywhere you call the composable, instead of only on the main component
 *
 * onPaneReady is called when viewpane & nodes have visible dimensions
 */
onPaneReady(({ fitView }) => {
  fitView()
})

onNodeDragStop((e) => console.log('drag stop', e))

const onDragOver = (event) => {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

/**
 * onConnect is called when a new connection is created.
 * You can add additional properties to your new edge (like a type or label) or block the creation altogether
 */
onConnect((params) => addEdges([params]))

const dark = ref(false)
const showFileSelector = ref(false)


/**
 * To update node properties you can simply use your elements v-model and mutate the elements directly
 * Changes should always be reflected on the graph reactively, without the need to overwrite the elements
 */
const updatePos = () =>
  elements.value.forEach((el) => {
    if (isNode(el)) {
      el.position = {
        x: Math.random() * 400,
        y: Math.random() * 400,
      }
    }
  })

/**
 * toObject transforms your current graph data to an easily persist-able object
 */
const logToObject = () => console.log(toObject())

/**
 * Resets the current viewpane transformation (zoom & pan)
 */
const resetTransform = () => setTransform({ x: 0, y: 0, zoom: 1 })

/**
 * Toggle dark and light theme
 */
const toggleClass = () => (dark.value = !dark.value)

/**
 * show import file selector
 */
const toggleFileSelector = () => (showFileSelector.value = !showFileSelector.value)

// Save Graph to node-flow.json
const exportFile = () => {
  const data = JSON.stringify(toObject())
  let filename = 'node-flow.json';
  let element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}

/**
 * Drop action of a node pulling from sidebar
 * @param {} event 
 */
const onDrop = (event) => {
  const type = event.dataTransfer?.getData('application/vueflow')

  const { left, top } = vueFlowRef.value.getBoundingClientRect()

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  const newNode = {
    id: getId(),
    type,
    position,
    label: `${type} node`,
  }

  addNodes([newNode])

  // align node position after drop, so it's centered to the mouse
  nextTick(() => {
    const node = findNode(newNode.id)
    const stop = watch(
      () => node.dimensions,
      (dimensions) => {
        if (dimensions.width > 0 && dimensions.height > 0) {
          node.position = { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 }
          stop()
        }
      },
      { deep: true, flush: 'post' },
    )
  })
}
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <VueFlow @dragover="onDragOver" v-model="elements" :class="{ dark }" class="basicflow" :default-zoom="1.5"
      :min-zoom="0.2" :max-zoom="4">

      <Background :pattern-color="dark ? '#FFFFFB' : '#aaa'" gap="8" />
      <MiniMap />
      <Controls />
      <Panel :position="PanelPosition.TopRight" class="controls">
        <v-btn title="Import" @click="toggleFileSelector" icon="mdi-file-import"> </v-btn>
        <v-btn title="Export" @click="exportFile" icon="mdi-file-export"> </v-btn>
        <v-btn title="Reset" @click="resetTransform" icon="mdi-crop-portrait"></v-btn>
        <v-btn title="Load" @click="onRestore" icon="mdi-restore"></v-btn>
        <v-btn title="Save" color="secondary" @click="onSave" icon="mdi-content-save"></v-btn>
        <v-btn title="Dark" color="primary" @click="toggleClass" icon="mdi-theme-light-dark"></v-btn>
        <!-- 
          <v-btn :style="{ backgroundColor: dark ? '#FFFFFB' : '#292524', color: dark ? '#292524' : '#FFFFFB' }"
          @click="toggleClass"  :prepend-icon="dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' " >
          </v-btn>
        -->
        <v-btn title="LogToObject" @click="logToObject" icon="mdi-export" ></v-btn>
        <VFileInput label="Graph JSONs" chips multiple v-if="showFileSelector" accept=".json" icon="mdi-file-import"></VFileInput>
      </Panel>
    </VueFlow>
    <Sidebar />
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.9.1/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.9.1/dist/theme-default.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/minimap@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css';

html,
body,
#app {
  margin: 0;
  height: 100%;
}

#app {
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}

.basicflow.dark{background:#57534e;color:#fffffb}.basicflow.dark .vue-flow__node{background:#292524;color:#fffffb}.basicflow.dark .vue-flow__controls .vue-flow__controls-button{background:#292524;fill:#fffffb;border-color:#fffffb}.basicflow.dark .vue-flow__edge-textbg{fill:#292524}.basicflow.dark .vue-flow__edge-text{fill:#fffffb}
.mbasicflow .tmp .control{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.mbasicflow .tmp .control button{padding:4px;border-radius:5px;font-weight:600;-webkit-box-shadow:0px 5px 10px 0px rgba(0,0,0,.3);box-shadow:0 5px 10px #0000004d;cursor:pointer;display:flex;justify-content:center;align-items:center}.basicflow .controls button:hover{transform:scale(102%);transition:.25s all ease}

.mbasicflow .controls button{
  width:24px;
  height:24px;
  background-color: #113285; 
  color: #FFFFFB
}

</style>