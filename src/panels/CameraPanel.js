import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

export class CameraPanel {
  constructor(folder, { camera, renderer, controls }) {
    this.camera   = camera
    this.renderer = renderer
    this.controls = controls
    this.folder   = folder

    // Guarda a câmera original (Perspective) para restaurar no reset
    this._defaultPosition = { x: 0, y: 1.5, z: 4 }

    this.state = {
      type:    'Perspective',
      fov:     60,
      near:    0.1,
      far:     1000,
      zoom:    1,
      // Preset de posição
      preset:  'Default',
    }

    this._build()
  }

  _build() {
    const f = this.folder

    // ── Tipo de câmera ─────────────────────────────────────────────────────
    this._addLabel(f,
      'Camera Type',
      'Projeção que define como a cena é vista'
    )

    f.addBinding(this.state, 'type', {
      label: 'Projection',
      options: {
        [LabelMap.cam_perspective.label]: 'Perspective',
        [LabelMap.cam_ortho.label]:       'Orthographic',
      }
    }).on('change', ({ value }) => {
      this._applyType(value)
    })

    f.addBlade({ view: 'separator' })

    // ── FOV ───────────────────────────────────────────────────────────────
    // FOV só existe na câmera Perspective
    // Na Orthographic não há perspectiva — sem ponto de fuga
    this._addLabel(f, LabelMap.cam_fov.label, LabelMap.cam_fov.desc)

    this._fovBinding = f.addBinding(this.state, 'fov', {
      label: 'FOV°', min: 10, max: 120, step: 1
    }).on('change', ({ value }) => {
      if (this.camera.isPerspectiveCamera) {
        this.camera.fov = value
        this.camera.updateProjectionMatrix()
      }
    })

    // ── Zoom ──────────────────────────────────────────────────────────────
    // zoom: em Perspective funciona como dolly
    // em Orthographic comprime o frustum diretamente
    this._addLabel(f, 'Zoom', 'Zoom da câmera — comprime o campo de visão')

    f.addBinding(this.state, 'zoom', {
      label: 'Zoom', min: 0.1, max: 5, step: 0.01
    }).on('change', ({ value }) => {
      this.camera.zoom = value
      this.camera.updateProjectionMatrix()
    })

    f.addBlade({ view: 'separator' })

    // ── Clipping Planes ───────────────────────────────────────────────────
    // near: objetos mais próximos que esse valor são cortados (invisíveis)
    // far: objetos mais distantes que esse valor são cortados
    // A diferença far-near define o "frustum depth" — afeta precisão do Z-buffer
    this._addLabel(f,
      'Clipping Planes',
      'Distâncias mínima e máxima de renderização'
    )

    f.addBinding(this.state, 'near', {
      label: LabelMap.cam_near.label, min: 0.01, max: 10, step: 0.01
    }).on('change', ({ value }) => {
      this.camera.near = value
      this.camera.updateProjectionMatrix()
    })

    f.addBinding(this.state, 'far', {
      label: LabelMap.cam_far.label, min: 10, max: 5000, step: 1
    }).on('change', ({ value }) => {
      this.camera.far = value
      this.camera.updateProjectionMatrix()
    })

    f.addBlade({ view: 'separator' })

    // ── Position Presets ──────────────────────────────────────────────────
    // Atalhos pra posições de câmera comuns em pipelines 3D
    this._addLabel(f,
      'View Presets',
      'Posições predefinidas de câmera — comum em viewports de ferramentas 3D'
    )

    f.addBinding(this.state, 'preset', {
      label: 'Preset',
      options: {
        'Default (3/4)': 'Default',
        'Front':         'Front',
        'Top':           'Top',
        'Side (Right)':  'Side',
        'Isometric':     'Isometric',
      }
    }).on('change', ({ value }) => {
      this._applyPreset(value)
    })

    f.addBlade({ view: 'separator' })

    // ── Reset Camera ──────────────────────────────────────────────────────
    f.addButton({ title: '⟳ Reset Camera Position' }).on('click', () => {
      this._applyPreset('Default')
    })
  }

  _applyType(type) {
    const aspect = this.renderer.domElement.width / this.renderer.domElement.height

    if (type === 'Orthographic') {
      // OrthographicCamera(left, right, top, bottom, near, far)
      // Usa o aspect pra manter proporção correta
      const s = 3
      const newCam = new THREE.OrthographicCamera(
        -s * aspect, s * aspect,
         s, -s,
        this.state.near,
        this.state.far
      )
      newCam.position.copy(this.camera.position)
      newCam.lookAt(this.controls.target)
      newCam.zoom = this.state.zoom
      newCam.updateProjectionMatrix()

      // OrbitControls precisa saber da nova câmera
      this.controls.object = newCam
      this.camera = newCam

      // Expõe pra o renderer — precisa atualizar a referência externa
      window.__vlab.camera = newCam

    } else {
      const newCam = new THREE.PerspectiveCamera(
        this.state.fov,
        aspect,
        this.state.near,
        this.state.far
      )
      newCam.position.copy(this.camera.position)
      newCam.lookAt(this.controls.target)
      newCam.zoom = this.state.zoom
      newCam.updateProjectionMatrix()

      this.controls.object = newCam
      this.camera = newCam
      window.__vlab.camera = newCam
    }

    this.controls.update()
  }

  _applyPreset(name) {
    const target = this.controls.target.clone()

    const presets = {
      // posição 3/4 — padrão de viewport
      Default:    { x: 0,   y: 1.5,  z: 4   },
      // câmera na frente, olhando pro eixo Z
      Front:      { x: 0,   y: 0,    z: 5   },
      // câmera acima, olhando pra baixo
      Top:        { x: 0,   y: 6,    z: 0.001 },
      // câmera à direita, olhando pro eixo X
      Side:       { x: 5,   y: 0,    z: 0   },
      // isométrico — ângulo 45° em X e Y, clássico de jogos isométricos
      Isometric:  { x: 4,   y: 4,    z: 4   },
    }

    const pos = presets[name] ?? presets.Default
    this.camera.position.set(pos.x, pos.y, pos.z)
    this.camera.lookAt(target)
    this.controls.update()
  }

  _addLabel(folder, title, desc) {
    folder.addBlade({
      view: 'text',
      label: '',
      parse: v => v,
      value: `${title} — ${desc}`,
    })
  }

  reset() {
    this.state.type   = 'Perspective'
    this.state.fov    = 60
    this.state.near   = 0.1
    this.state.far    = 1000
    this.state.zoom   = 1
    this.state.preset = 'Default'

    if (!this.camera.isPerspectiveCamera) {
      this._applyType('Perspective')
    }

    this.camera.fov  = 60
    this.camera.near = 0.1
    this.camera.far  = 1000
    this.camera.zoom = 1
    this.camera.updateProjectionMatrix()

    this._applyPreset('Default')
  }
}