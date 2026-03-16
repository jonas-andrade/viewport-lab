import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

// Tipos de material disponíveis — nome exibido => classe Three.js
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

// Materiais PBR: são os que têm roughness, metalness, emissive etc.
// Os outros (Basic, Normal, Depth) não têm essas propriedades
const PBR_TYPES = new Set([
  'MeshStandardMaterial',
  'MeshPhysicalMaterial',
  'MeshPhongMaterial',
  'MeshLambertMaterial',
  'MeshToonMaterial',
])

export class SurfacePanel {
  constructor(folder, { mesh, scene }) {
    this.mesh   = mesh
    this.scene  = scene
    this.folder = folder

    // Estado espelho do material atual
    // Tweakpane precisa de um objeto JS puro pra fazer binding
    this.state = {
      materialType:      'MeshStandardMaterial',
      color:             { r: 79,  g: 142, b: 247 }, // #4f8ef7
      roughness:         0.4,
      metalness:         0.1,
      emissive:          { r: 0, g: 0, b: 0 },
      emissiveIntensity: 0,
      opacity:           1.0,
      transparent:       false,
      wireframe:         false,
      flatShading:       false,
      side:              'FrontSide',
      // MeshPhysicalMaterial exclusivos
      clearcoat:         0,
      clearcoatRoughness: 0,
      transmission:      0,   // transmissão = vidro/transparência física
      ior:               1.5, // Index of Refraction — índice de refração (vidro=1.5)
    }

    this._pbr_folder     = null
    this._physical_folder = null

    this._build()
  }

  _build() {
    const f = this.folder

    // ── Tipo de material ───────────────────────────────────────────────────
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
    this._addLabel(f,
      LabelMap.color.label,
      LabelMap.color.desc
    )

    f.addBinding(this.state, 'color', {
      label: 'Albedo',
      color: { type: 'float' }  // float: valores 0-1 internamente
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

    // ── Propriedades PBR ───────────────────────────────────────────────────
    // Essa folder vai ser mostrada/escondida dependendo do material
    this._pbr_folder = f.addFolder({ title: 'PBR Properties', expanded: true })
    this._buildPBR(this._pbr_folder)

    // ── Physical exclusivos ────────────────────────────────────────────────
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

    // Inicia com PBR visível (MeshStandardMaterial é PBR)
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
    // clearcoat: camada de verniz sobre o material — tipo carro
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

    // transmission: quanto de luz passa pelo objeto — vidro, plástico translúcido
    this._addLabel(f, 'Transmission', 'Transmissão de luz — simula vidro e materiais translúcidos')
    f.addBinding(this.state, 'transmission', {
      label: 'Transmission', min: 0, max: 1, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.transmission !== undefined) {
        this.mesh.material.transmission = value
        // transmission requer transparent = true internamente
        this.mesh.material.transparent = value > 0
        this.mesh.material.needsUpdate = true
      }
    })

    // IOR: Index of Refraction — quanto a luz dobra ao passar pelo material
    // Valores reais: ar=1.0, água=1.33, vidro=1.5, diamante=2.4
    this._addLabel(f, 'IOR', 'Index of Refraction — quanto a luz dobra ao atravessar o objeto')
    f.addBinding(this.state, 'ior', {
      label: 'IOR', min: 1.0, max: 2.5, step: 0.01
    }).on('change', ({ value }) => {
      if (this.mesh.material.ior !== undefined)
        this.mesh.material.ior = value
    })
  }

  // Troca o material completamente — cria instância nova da classe certa
  _swapMaterial(typeName) {
    const MatClass = MATERIAL_TYPES[typeName]
    if (!MatClass) return

    // Lê a cor atual do estado pra preservar no novo material
    const oldColor = this.state.color

    // Descarta o material anterior da GPU
    this.mesh.material.dispose()

    const props = {
      color: new THREE.Color(
        oldColor.r / 255,
        oldColor.g / 255,
        oldColor.b / 255
      ),
      side: THREE.FrontSide,
    }

    // Só passa roughness/metalness se o material suporta
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

  // Esconde/mostra folders PBR conforme o material suporta
  _refreshPBRVisibility(typeName) {
    const hasPBR = PBR_TYPES.has(typeName)
    const isPhysical = typeName === 'MeshPhysicalMaterial'

    if (this._pbr_folder) {
      this._pbr_folder.hidden = !hasPBR
    }
    if (this._physical_folder) {
      this._physical_folder.hidden = !isPhysical
    }
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