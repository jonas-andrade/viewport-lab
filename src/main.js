import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PanelManager } from './panels/PanelManager.js'

document.querySelector('#app').innerHTML = `
  <div id="viewport-container">
    <div id="panel"></div>
    <div id="canvas-wrapper">
      <button id="btn-clear" title="Limpar cena">⟳</button>
    </div>
  </div>
`

// ─── RENDERER ────────────────────────────────────────────────────────────────

const wrapper = document.getElementById('canvas-wrapper')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
wrapper.appendChild(renderer.domElement)

// ─── SCENE ───────────────────────────────────────────────────────────────────

const scene = new THREE.Scene()
scene.background = new THREE.Color('#1a1a1a')

// ─── CAMERA ──────────────────────────────────────────────────────────────────

const camera = new THREE.PerspectiveCamera(
  60,
  wrapper.clientWidth / wrapper.clientHeight,
  0.1,
  1000
)
camera.position.set(0, 1.5, 4)

// ─── CONTROLS ────────────────────────────────────────────────────────────────

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.target.set(0, 0, 0)

// ─── LUZES DE BASE ───────────────────────────────────────────────────────────
// Estas luzes são fixas — sempre presentes na cena como ponto de partida
// O toggle global de Lighting no painel as controla junto com as adicionadas

const ambient = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambient)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(5, 8, 5)
dirLight.castShadow = true
dirLight.shadow.mapSize.set(1024, 1024)
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far = 50
scene.add(dirLight)

// ─── GROUND + GRID ───────────────────────────────────────────────────────────

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

// ─── OBJETO PRINCIPAL ────────────────────────────────────────────────────────
// Mesh criado vazio — PanelManager.resetAll() define o estado inicial

const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
const material = new THREE.MeshStandardMaterial()
const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

// ─── RESIZE ──────────────────────────────────────────────────────────────────

function onResize() {
  const w = wrapper.clientWidth
  const h = wrapper.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
window.addEventListener('resize', onResize)

// ─── PANEL MANAGER ───────────────────────────────────────────────────────────

const panelManager = new PanelManager({
  scene, camera, renderer, mesh, material, controls
})

panelManager.resetAll()

// ─── CLEAR BUTTON ────────────────────────────────────────────────────────────

document.getElementById('btn-clear').addEventListener('click', () => {
  panelManager.resetAll()
})

// ─── LOOP ────────────────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

animate()