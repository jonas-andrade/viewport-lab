import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

const MATERIAL_TYPES = {
  'MeshStandardMaterial':  THREE.MeshStandardMaterial,
  'MeshPhysicalMaterial':  THREE.MeshPhysicalMaterial,
  'MeshPhongMaterial':     THREE.MeshPhongMaterial,
  'MeshLambertMaterial':   THREE.MeshLambertMaterial,
  'MeshBasicMaterial':     THREE.MeshBasicMaterial,
  'MeshToonMaterial':      THREE.MeshToonMaterial,
  'MeshNormalMaterial':    THREE.MeshNormalMaterial,
  'MeshDepthMaterial':     THREE.MeshDepthMaterial,
}

const PBR_TYPES = new Set([
  'MeshStandardMaterial',
  'MeshPhysicalMaterial',
  'MeshPhongMaterial',
  'MeshLambertMaterial',
  'MeshToonMaterial',
])

export class SurfacePanel {
  constructor(folder, { mesh }) {
    this.mesh   = mesh
    this.folder = folder

    this.state = {
      materialType:       'MeshStandardMaterial',
      color:              { r: 79, g: 142, b: 247 },
      roughness:          0.4,
      metalness:          0.1,
      emissive:           { r: 0, g: 0, b: 0 },
      emissiveIntensity:  0,
      opacity:            1.0,
      transparent:        false,
      side:               'FrontSide',
      clearcoat:          0,
      clearcoatRoughness: 0,
      transmission:       0,
      ior:                1.5,
    }

    this._pbr_folder      = null
    this._physical_folder = null
    this.uploadState      = { slot: 'map' }

    this._build()
  }

  _build() {
    const f = this.folder

    // ── Material type ──────────────────────────────────────────────────────
    this._addLabel(f,
      'Material Type',
      'Define o modelo de shading — como a superfície calcula iluminação'
    )
    f.addBinding(this.state, 'materialType', {
      label: 'Shader',
      options: Object.fromEntries(Object.keys(MATERIAL_TYPES).map(k => [k, k]))
    }).on('change', ({ value }) => {
      this._swapMaterial(value)
      this._refreshPBRVisibility(value)
    })

    f.addBlade({ view: 'separator' })

    // ── Cor base ───────────────────────────────────────────────────────────
    this._addLabel(f, LabelMap.color.label, LabelMap.color.desc)
    f.addBinding(this.state, 'color', {
      label: 'Albedo',
      color: { type: 'float' }
    }).on('change', ({ value }) => {
      if (this.mesh.material.color) {
        this.mesh.material.color.setRGB(
          value.r / 255,
          value.g / 255,
          value.b / 255
        )
      }
    })

    f.addBlade({ view: 'separator' })

    // ── PBR ───────────────────────────────────────────────────────────────
    this._pbr_folder = f.addFolder({ title: 'PBR Properties', expanded: true })
    this._buildPBR(this._pbr_folder)

    this._physical_folder = f.addFolder({ title: 'Physical (Advanced)', expanded: false })
    this._buildPhysical(this._physical_folder)

    f.addBlade({ view: 'separator' })

    // ── Opacidade ─────────────────────────────────────────────────────────
    this._addLabel(f, LabelMap.opacity.label, LabelMap.opacity.desc)
    f.addBinding(this.state, 'transparent', {
      label: LabelMap.transparent.label
    }).on('change', ({ value }) => {
      this.mesh.material.transparent = value
      this.mesh.material.needsUpdate = true
    })

    f.addBinding(this.state, 'opacity', {
      label: LabelMap.opacity.label,
      min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      this.mesh.material.opacity = value
    })

    f.addBlade({ view: 'separator' })

    // ── Side ──────────────────────────────────────────────────────────────
    this._addLabel(f, 'Side', 'Qual face da geometria é renderizada')
    f.addBinding(this.state, 'side', {
      label: 'Face Side',
      options: {
        [LabelMap.side_front.label]:  'FrontSide',
        [LabelMap.side_back.label]:   'BackSide',
        [LabelMap.side_double.label]: 'DoubleSide',
      }
    }).on('change', ({ value }) => {
      const map = {
        FrontSide:  THREE.FrontSide,
        BackSide:   THREE.BackSide,
        DoubleSide: THREE.DoubleSide,
      }
      this.mesh.material.side = map[value]
      this.mesh.material.needsUpdate = true
    })

    f.addBlade({ view: 'separator' })

    // ── Texture Upload ─────────────────────────────────────────────────────
    this._addLabel(f,
      'Texture Upload',
      'Carregue imagens do disco para aplicar como mapas PBR'
    )
    f.addBinding(this.uploadState, 'slot', {
      label: 'Apply as',
      options: {
        'Albedo Map':      'map',
        'Normal Map':      'normalMap',
        'Roughness Map':   'roughnessMap',
        'Metalness Map':   'metalnessMap',
        'AO Map':          'aoMap',
        'Displacement Map':'displacementMap',
        'Emissive Map':    'emissiveMap',
      }
    })

    f.addButton({ title: '📁 Upload Texture' }).on('click', () => {
      this._openTexturePicker()
    })

    f.addButton({ title: '✕ Clear Texture Slot' }).on('click', () => {
      const slot = this.uploadState.slot
      if (this.mesh.material[slot]) {
        this.mesh.material[slot].dispose()
        this.mesh.material[slot] = null
        this.mesh.material.needsUpdate = true
      }
    })

    this._refreshPBRVisibility('MeshStandardMaterial')
  }

  _buildPBR(f) {
    this._addLabel(f, LabelMap.roughness.label, LabelMap.roughness.desc)
    f.addBinding(this.state, 'roughness', {
      label: 'Roughness', min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.roughness !== undefined)
        this.mesh.material.roughness = value
    })

    this._addLabel(f, LabelMap.metalness.label, LabelMap.metalness.desc)
    f.addBinding(this.state, 'metalness', {
      label: 'Metalness', min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.metalness !== undefined)
        this.mesh.material.metalness = value
    })

    f.addBlade({ view: 'separator' })

    this._addLabel(f, LabelMap.emissive.label, LabelMap.emissive.desc)
    f.addBinding(this.state, 'emissive', {
      label: 'Emissive',
      color: { type: 'float' }
    }).on('change', ({ value }) => {
      if (this.mesh.material.emissive) {
        this.mesh.material.emissive.setRGB(
          value.r / 255,
          value.g / 255,
          value.b / 255
        )
      }
    })

    f.addBinding(this.state, 'emissiveIntensity', {
      label: LabelMap.emissive_intensity.label,
      min: 0, max: 5, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.emissiveIntensity !== undefined)
        this.mesh.material.emissiveIntensity = value
    })
  }

  _buildPhysical(f) {
    this._addLabel(f, 'Clearcoat', 'Camada brilhante sobre o material — efeito verniz/laca')
    f.addBinding(this.state, 'clearcoat', {
      label: 'Clearcoat', min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.clearcoat !== undefined)
        this.mesh.material.clearcoat = value
    })

    f.addBinding(this.state, 'clearcoatRoughness', {
      label: 'Clearcoat Roughness', min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.clearcoatRoughness !== undefined)
        this.mesh.material.clearcoatRoughness = value
    })

    f.addBlade({ view: 'separator' })

    this._addLabel(f, 'Transmission', 'Transmissão de luz — simula vidro e materiais translúcidos')
    f.addBinding(this.state, 'transmission', {
      label: 'Transmission', min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.transmission !== undefined) {
        this.mesh.material.transmission = value
        this.mesh.material.transparent  = value > 0
        this.mesh.material.needsUpdate  = true
      }
    })

    this._addLabel(f, 'IOR', 'Index of Refraction — quanto a luz dobra ao atravessar o objeto')
    f.addBinding(this.state, 'ior', {
      label: 'IOR', min: 1.0, max: 2.5, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.ior !== undefined)
        this.mesh.material.ior = value
    })
  }

  _swapMaterial(typeName) {
    const MatClass = MATERIAL_TYPES[typeName]
    if (!MatClass) return

    const oldColor = this.state.color
    this.mesh.material.dispose()

    const props = {
      color: new THREE.Color(
        oldColor.r / 255,
        oldColor.g / 255,
        oldColor.b / 255
      ),
      side: THREE.FrontSide,
    }

    if (PBR_TYPES.has(typeName) &&
        typeName !== 'MeshBasicMaterial' &&
        typeName !== 'MeshNormalMaterial' &&
        typeName !== 'MeshDepthMaterial') {
      props.roughness = this.state.roughness
      props.metalness = this.state.metalness
    }

    this.mesh.material = new MatClass(props)
    this.mesh.material.needsUpdate = true
  }

  _refreshPBRVisibility(typeName) {
    const hasPBR     = PBR_TYPES.has(typeName)
    const isPhysical = typeName === 'MeshPhysicalMaterial'
    if (this._pbr_folder)      this._pbr_folder.hidden      = !hasPBR
    if (this._physical_folder) this._physical_folder.hidden = !isPhysical
  }

  _openTexturePicker() {
    const input  = document.createElement('input')
    input.type   = 'file'
    input.accept = 'image/*'

    input.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (!file) return

      const url    = URL.createObjectURL(file)
      const loader = new THREE.TextureLoader()

      loader.load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace

        const slot = this.uploadState.slot

        if (this.mesh.material[slot]) {
          this.mesh.material[slot].dispose()
        }

        // aoMap precisa de uv1 — segundo canal de UV
        if (slot === 'aoMap') {
          const uv = this.mesh.geometry.attributes.uv
          if (uv && !this.mesh.geometry.attributes.uv1) {
            this.mesh.geometry.setAttribute('uv1', uv.clone())
          }
        }

        this.mesh.material[slot] = texture
        this.mesh.material.needsUpdate = true
        URL.revokeObjectURL(url)
      })
    })

    input.click()
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
    // Limpa todas as texturas carregadas
    const slots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap',
                   'aoMap', 'displacementMap', 'emissiveMap']
    slots.forEach(slot => {
      if (this.mesh.material[slot]) {
        this.mesh.material[slot].dispose()
        this.mesh.material[slot] = null
      }
    })

    this.state.materialType      = 'MeshStandardMaterial'
    this.state.color             = { r: 79, g: 142, b: 247 }
    this.state.roughness         = 0.4
    this.state.metalness         = 0.1
    this.state.emissive          = { r: 0, g: 0, b: 0 }
    this.state.emissiveIntensity = 0
    this.state.opacity           = 1.0
    this.state.transparent       = false
    this.state.clearcoat         = 0
    this.state.transmission      = 0
    this.state.ior               = 1.5

    this._swapMaterial('MeshStandardMaterial')
    this._refreshPBRVisibility('MeshStandardMaterial')
  }
}