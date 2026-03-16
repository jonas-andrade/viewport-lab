import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─── DOM ────────────────────────────────────────────────────────────────────

document.querySelector('#app').innerHTML = `
  <div id="viewport-container">
    <div id="panel">
      <div class="panel-title">Viewport Lab</div>
      <!-- painéis vão ser injetados aqui nas próximas fases -->
    </div>
    <div id="canvas-wrapper">
      <button id="btn-clear" title="Limpar cena">⟳</button>
    </div>
  </div>
`

// ─── RENDERER ────────────────────────────────────────────────────────────────
// WebGLRenderer: o motor que converte a cena 3D em pixels na tela
// antialias: suaviza as bordas serrilhadas dos objetos

const wrapper = document.getElementById('canvas-wrapper')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)   // resolução nativa do monitor
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight)
renderer.shadowMap.enabled = true                 // habilita o sistema de sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap  // tipo: sombras suaves
renderer.toneMapping = THREE.ACESFilmicToneMapping // mapeamento de tom cinematográfico
renderer.toneMappingExposure = 1.0
wrapper.appendChild(renderer.domElement)          // injeta o <canvas> no DOM

// ─── SCENE ───────────────────────────────────────────────────────────────────
// Scene: o container que guarda todos os objetos, luzes e câmeras

const scene = new THREE.Scene()
scene.background = new THREE.Color('#1a1a1a')
// scene.background = new THREE.Color('#fff')

// ─── CAMERA ──────────────────────────────────────────────────────────────────
// PerspectiveCamera(fov, aspect, near, far)
// fov: campo de visão em graus — quanto maior, mais "wide angle"
// aspect: proporção largura/altura — precisa acompanhar o canvas
// near/far: objetos fora desse intervalo não são renderizados

const camera = new THREE.PerspectiveCamera(
  60,
  wrapper.clientWidth / wrapper.clientHeight,
  0.1,
  1000
)
camera.position.set(0, 1.5, 4)

// ─── CONTROLS ────────────────────────────────────────────────────────────────
// OrbitControls: permite orbitar, zoom e pan com o mouse

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true      // inércia — movimento mais suave
controls.dampingFactor = 0.05
controls.target.set(0, 0, 0)

// ─── LIGHTS ──────────────────────────────────────────────────────────────────
// AmbientLight: luz sem direção, ilumina tudo igualmente
// DirectionalLight: luz direcional, como o sol — tem sombra

const ambient = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambient)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(5, 8, 5)
dirLight.castShadow = true
dirLight.shadow.mapSize.set(1024, 1024)  // resolução do shadow map
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far = 50
scene.add(dirLight)

// ─── GROUND ──────────────────────────────────────────────────────────────────
// Plano que recebe sombra — ajuda a perceber a iluminação

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 1 })
)
ground.rotation.x = -Math.PI / 2
ground.position.y = -1
ground.receiveShadow = true
scene.add(ground)

// ─── OBJETO PRINCIPAL ────────────────────────────────────────────────────────
// O objeto que vai ser manipulado pelos painéis
// MeshStandardMaterial: material PBR (Physically Based Rendering)
// PBR = renderização baseada em física, simula como luz real se comporta

const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
const material = new THREE.MeshStandardMaterial({
  color: '#4f8ef7',
  roughness: 0.4,
  metalness: 0.1,
})
const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

// ─── GRID HELPER ─────────────────────────────────────────────────────────────
// Grid visual de referência — comum em viewports de editores 3D

const grid = new THREE.GridHelper(10, 20, '#2a2a2a', '#222222')
grid.position.y = -1
scene.add(grid)

// ─── RESIZE ──────────────────────────────────────────────────────────────────

function onResize() {
  const w = wrapper.clientWidth
  const h = wrapper.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

window.addEventListener('resize', onResize)

// ─── CLEAR BUTTON ────────────────────────────────────────────────────────────
// Reseta o objeto ao estado padrão

document.getElementById('btn-clear').addEventListener('click', () => {
  mesh.geometry.dispose()
  mesh.geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  mesh.material.color.set('#4f8ef7')
  mesh.material.roughness = 0.4
  mesh.material.metalness = 0.1
  mesh.material.wireframe = false
  mesh.material.needsUpdate = true
  mesh.rotation.set(0, 0, 0)
  mesh.scale.set(1, 1, 1)
})

// ─── LOOP ────────────────────────────────────────────────────────────────────
// requestAnimationFrame: pede ao browser pra chamar essa função
// antes de cada frame — geralmente 60x por segundo

function animate() {
  requestAnimationFrame(animate)
  controls.update()           // necessário por causa do damping
  renderer.render(scene, camera)
}

animate()

// ─── EXPORTS (para os painéis usarem nas próximas fases) ─────────────────────
export { scene, camera, renderer, mesh, material, controls }