import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PanelManager } from './panels/PanelManager.js'
import { initDictionary } from './utils/Dictionary.js'
import { LabelMap } from './utils/LabelMap.js'

document.querySelector('#app').innerHTML = `
  <div id="viewport-container">
    <div id="panel-wrap">
      <div id="panel"></div>
      <div id="panel-dict-slot"></div>
    </div>
    <div id="canvas-wrapper">
      <button id="btn-clear" title="Resetar cena">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M13 8A5 5 0 1 1 8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M8 1.5L10.5 4L8 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
`

const wrapper = document.getElementById('canvas-wrapper')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type    = THREE.PCFSoftShadowMap
renderer.toneMapping       = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
wrapper.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color('#1a1a1a')

const camera = new THREE.PerspectiveCamera(60, wrapper.clientWidth / wrapper.clientHeight, 0.1, 1000)
camera.position.set(0, 1.5, 4)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.target.set(0, 0, 0)

const ambient = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambient)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(5, 8, 5)
dirLight.castShadow = true
dirLight.shadow.mapSize.set(1024, 1024)
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far  = 50
scene.add(dirLight)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 1 })
)
ground.rotation.x = -Math.PI / 2
ground.position.y = -1
ground.receiveShadow = true
scene.add(ground)

const grid = new THREE.GridHelper(10, 20, '#2a2a2a', '#222222')
grid.position.y = -1
scene.add(grid)

const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
const material = new THREE.MeshStandardMaterial()
const mesh     = new THREE.Mesh(geometry, material)
mesh.castShadow    = true
mesh.receiveShadow = true
scene.add(mesh)

function onResize() {
  const w = wrapper.clientWidth
  const h = wrapper.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
window.addEventListener('resize', onResize)

window.__vlab = { scene, camera, renderer, mesh, material, controls }

const panelManager = new PanelManager({ scene, camera, renderer, mesh, material, controls })
panelManager.resetAll()

// Dictionary — inicializa e injeta nos painéis que precisam de showByKey
const dictSlot = document.getElementById('panel-dict-slot')
const dict = initDictionary(dictSlot, LabelMap)

// Injeta referência do dict nos painéis que usam showByKey ao mudar dropdown
panelManager.panels.surface._dict = dict

const panelEl   = document.getElementById('panel')
const reDecorate = () => requestAnimationFrame(() => dict.decorateAll(panelEl))
panelEl.addEventListener('click', reDecorate)
reDecorate()

document.getElementById('btn-clear').addEventListener('click', () => {
  panelManager.resetAll()
  reDecorate()
})

function animate() {
  requestAnimationFrame(animate)
  // Lê sempre de window.__vlab para pegar câmera/controls trocados
  window.__vlab.controls.update()
  const composer = window.__vlab.composer
  if (composer) composer.render()
  else renderer.render(scene, window.__vlab.camera)
}
animate()