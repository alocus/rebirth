<script setup>
import { Panel, PanelPosition, VueFlow, isNode, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { ref } from 'vue'
import { initialElements } from './initial-elements.js'
import { nextTick, watch } from 'vue'
import Sidebar from './Sidebar.vue'

let id = 0
const getId = () => `dndnode_${id++}`
const selectedFiles = ref([])

const flowKey = 'nodes-flow'


/**
 *  Simple JavaScript Promise that reads a file as text.
 **/
function readFileAsText(file){
  
  return new Promise(function(resolve,reject){
      let fr = new FileReader();

      fr.onload = function(){
          resolve(onRestore(fr.result));
      };

      fr.onerror = function(){
          reject(fr);
      };

      fr.readAsText(file);
  });
}


async function importFiles () {
  showFileSelector.value=false

  let readers = [];
  let files = selectedFiles.value
  // Abort if there were no files selected
  if(!files.length) return;

  // Store promises in array
  for(let i = 0;i < files.length;i++){
    readFileAsText(files[i])
    readers.push(files[i].name);
  }

  // Trigger Promises
  Promise.all(readers).then((values) => {
      // Values will be an array that contains an item
      // with the text of every selected file
      // ["File1 Content", "File2 Content" ... "FileN Content"]
      debugger
      console.log(values);
  });
}


/**
 * useVueFlow provides all event handlers and store properties
 * You can pass the composable an object that has the same properties as the VueFlow component props
 */
const { setNodes, setEdges, dimensions, onPaneReady, onNodeDragStop, onConnect, addEdges, setTransform, toObject, findNode, nodes, edges, addNodes, viewport, project, vueFlowRef } = useVueFlow({
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
const onRestore = ( file = null ) => {
  debugger
  const graph = file??localStorage.getItem(flowKey)
  const flow = JSON.parse(graph)

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
        <VToolbar>
          <VBtn title="Import" @click="toggleFileSelector" icon="mdi-cloud-upload"> </VBtn>
          <VBtn title="Export" @click="exportFile" icon="mdi-cloud-download"> </VBtn>
          <v-divider vertical></v-divider>
          <VBtn title="Reset" @click="resetTransform" icon="mdi-crop-portrait"></VBtn>
          <VBtn title="Load the last Snapshot" color="secondary" @click="onRestore" icon="mdi-camera-burst"></VBtn>
          <VBtn title="Take a Snapshot" color="secondary" @click="onSave" icon="mdi-camera-iris"></VBtn>
          <VBtn title="Dark" color="primary" @click="toggleClass" icon="mdi-theme-light-dark"></VBtn>
          <!-- 
            <VBtn :style="{ backgroundColor: dark ? '#FFFFFB' : '#292524', color: dark ? '#292524' : '#FFFFFB' }"
            @click="toggleClass"  :prepend-icon="dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' " >
            </VBtn>
          -->
          <VBtn title="LogToObject" @click="logToObject" icon="mdi-export" ></VBtn>
        </VToolbar>

        <v-container fill-height v-if="showFileSelector">
          <VRow justify="center">
            <VCol cols="auto">
              <v-card width="auto" height="auto" raised>
                <v-card-title>Vuetify v-file-input Example:</v-card-title>
                <br>
                <v-card-text>
                  <VFileInput v-model="selectedFiles" label="Select your files" chips counter multiple 
                    accept=".json" prepend-icon="mdi-graph-outline">
                  </VFileInput>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn right @click="importFiles">Read File</v-btn>
                </v-card-actions>
              </v-card>
            </VCol>
          </VRow>
        </v-container>
      </Panel>
    </VueFlow>
    <Sidebar><NodeConfigPanel></NodeConfigPanel></Sidebar>
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

</style>