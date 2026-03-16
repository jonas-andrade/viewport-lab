import * as THREE from 'three'

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
    'MeshStandardMaterial', 'MeshPhysicalMaterial',
    'MeshPhongMaterial', 'MeshLambertMaterial', 'MeshToonMaterial',
])

// Mapa: valor do dropdown → chave no LabelMap (para showByKey no dicionário)
const MAT_DICT_KEY = {
    'MeshStandardMaterial': 'mat_standard',
    'MeshPhysicalMaterial': 'mat_physical',
    'MeshPhongMaterial':    'mat_phong',
    'MeshLambertMaterial':  'mat_lambert',
    'MeshBasicMaterial':    'mat_basic',
    'MeshToonMaterial':     'mat_toon',
    'MeshNormalMaterial':   'mat_normal',
    'MeshDepthMaterial':    'mat_depth',
}

const SLOT_DICT_KEY = {
    'map':              'albedo_map',
    'normalMap':        'normal_map',
    'roughnessMap':     'roughness_map',
    'metalnessMap':     'metalness_map',
    'aoMap':            'ao_map',
    'displacementMap':  'displacement_map',
    'emissiveMap':      'emissive_map',
}

export class SurfacePanel {
    constructor(folder, { mesh }) {
        this.mesh   = mesh
        this.folder = folder
        this._dict  = null   // será injetado pelo main.js

        this.state = {
            materialType: 'MeshStandardMaterial',
            color:        { r: 0.31, g: 0.56, b: 0.97 },
            roughness:    0.4,
            metalness:    0.1,
            emissive:     { r: 0, g: 0, b: 0 },
            emissiveIntensity: 0,
            opacity:      1.0,
            transparent:  false,
            side:         'FrontSide',
            clearcoat:    0,
            clearcoatRoughness: 0,
            transmission: 0,
            ior:          1.5,
        }

        this._pbr_folder      = null
        this._physical_folder = null
        this.uploadState = { slot: 'map' }
        this._build()
    }

    _build() {
        const f = this.folder

        // 'Material Type' → LabelMap.material_type
        f.addBinding(this.state, 'materialType', {
            label: 'Material Type',
            options: Object.fromEntries(Object.keys(MATERIAL_TYPES).map(k => [k, k]))
        }).on('change', ({ value }) => {
            this._swapMaterial(value)
            this._refreshPBRVisibility(value)
            // Ao mudar o material, mostra a definição do tipo escolhido no dicionário
            this._dict?.showByKey(MAT_DICT_KEY[value])
        })

        f.addBlade({ view: 'separator' })

        // 'Albedo' → LabelMap.albedo
        f.addBinding(this.state, 'color', {
            label: 'Albedo',
            color: { type: 'float' }
        }).on('change', ({ value }) => {
            if (this.mesh.material.color)
                this.mesh.material.color.setRGB(value.r, value.g, value.b)
        })

        f.addBlade({ view: 'separator' })

        this._pbr_folder = f.addFolder({ title: 'PBR Properties', expanded: false })
        this._buildPBR(this._pbr_folder)

        this._physical_folder = f.addFolder({ title: 'Physical', expanded: false })
        this._buildPhysical(this._physical_folder)

        f.addBlade({ view: 'separator' })

        // 'Transparent' → LabelMap.transparent
        f.addBinding(this.state, 'transparent', { label: 'Transparent' })
            .on('change', ({ value }) => {
                this.mesh.material.transparent = value
                this.mesh.material.needsUpdate = true
            })

        // 'Opacity' → LabelMap.opacity
        f.addBinding(this.state, 'opacity', {
            label: 'Opacity', min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => { this.mesh.material.opacity = value })

        f.addBlade({ view: 'separator' })

        // 'Side' → LabelMap.side
        f.addBinding(this.state, 'side', {
            label: 'Side',
            options: { 'FrontSide': 'FrontSide', 'BackSide': 'BackSide', 'DoubleSide': 'DoubleSide' }
        }).on('change', ({ value }) => {
            const map = { FrontSide: THREE.FrontSide, BackSide: THREE.BackSide, DoubleSide: THREE.DoubleSide }
            this.mesh.material.side = map[value]
            this.mesh.material.needsUpdate = true
        })

        f.addBlade({ view: 'separator' })

        // 'Texture Slot' → LabelMap.texture_slot
        f.addBinding(this.uploadState, 'slot', {
            label: 'Texture Slot',
            options: {
                'Albedo Map':       'map',
                'Normal Map':       'normalMap',
                'Roughness Map':    'roughnessMap',
                'Metalness Map':    'metalnessMap',
                'AO Map':           'aoMap',
                'Displacement Map': 'displacementMap',
                'Emissive Map':     'emissiveMap',
            }
        }).on('change', ({ value }) => {
            // Ao mudar o slot, mostra definição do mapa no dicionário
            this._dict?.showByKey(SLOT_DICT_KEY[value])
        })

        f.addButton({ title: '📁 Upload Texture' }).on('click', () => { this._openTexturePicker() })
        f.addButton({ title: '✕ Clear Slot' }).on('click', () => {
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
        // 'Roughness' → LabelMap.roughness
        f.addBinding(this.state, 'roughness', {
            label: 'Roughness', min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.roughness !== undefined) this.mesh.material.roughness = value
        })

        // 'Metalness' → LabelMap.metalness
        f.addBinding(this.state, 'metalness', {
            label: 'Metalness', min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.metalness !== undefined) this.mesh.material.metalness = value
        })

        f.addBlade({ view: 'separator' })

        // 'Emissive' → LabelMap.emissive
        f.addBinding(this.state, 'emissive', {
            label: 'Emissive', color: { type: 'float' }
        }).on('change', ({ value }) => {
            if (this.mesh.material.emissive)
                this.mesh.material.emissive.setRGB(value.r, value.g, value.b)
        })

        // 'Emissive Intensity' → LabelMap.emissive_intensity
        f.addBinding(this.state, 'emissiveIntensity', {
            label: 'Emissive Intensity', min: 0, max: 5, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.emissiveIntensity !== undefined)
                this.mesh.material.emissiveIntensity = value
        })
    }

    _buildPhysical(f) {
        // 'Clearcoat' → LabelMap.clearcoat
        f.addBinding(this.state, 'clearcoat', {
            label: 'Clearcoat', min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.clearcoat !== undefined) this.mesh.material.clearcoat = value
        })

        // 'Clearcoat Roughness' → LabelMap.clearcoat_roughness
        f.addBinding(this.state, 'clearcoatRoughness', {
            label: 'Clearcoat Roughness', min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.clearcoatRoughness !== undefined)
                this.mesh.material.clearcoatRoughness = value
        })

        f.addBlade({ view: 'separator' })

        // 'Transmission' → LabelMap.transmission
        f.addBinding(this.state, 'transmission', {
            label: 'Transmission', min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.transmission !== undefined) {
                this.mesh.material.transmission = value
                this.mesh.material.transparent  = value > 0
                this.mesh.material.needsUpdate  = true
            }
        })

        // 'IOR' → LabelMap.ior
        f.addBinding(this.state, 'ior', {
            label: 'IOR', min: 1.0, max: 2.5, step: 0.01
        }).on('change', ({ value }) => {
            if (this.mesh.material.ior !== undefined) this.mesh.material.ior = value
        })
    }

    _swapMaterial(typeName) {
        const MatClass = MATERIAL_TYPES[typeName]
        if (!MatClass) return
        const oldColor = this.state.color
        this.mesh.material.dispose()
        const props = {
            color: new THREE.Color(oldColor.r, oldColor.g, oldColor.b),
            side:  THREE.FrontSide,
        }
        if (PBR_TYPES.has(typeName)) {
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
        const input = document.createElement('input')
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
                if (this.mesh.material[slot]) this.mesh.material[slot].dispose()
                if (slot === 'aoMap') {
                    const uv = this.mesh.geometry.attributes.uv
                    if (uv && !this.mesh.geometry.attributes.uv1)
                        this.mesh.geometry.setAttribute('uv1', uv.clone())
                }
                this.mesh.material[slot] = texture
                this.mesh.material.needsUpdate = true
                URL.revokeObjectURL(url)
            })
        })
        input.click()
    }

    reset() {
        const slots = ['map','normalMap','roughnessMap','metalnessMap','aoMap','displacementMap','emissiveMap']
        slots.forEach(slot => {
            if (this.mesh.material[slot]) { this.mesh.material[slot].dispose(); this.mesh.material[slot] = null }
        })
        this.state.materialType       = 'MeshStandardMaterial'
        this.state.color              = { r: 0.31, g: 0.56, b: 0.97 }
        this.state.roughness          = 0.4
        this.state.metalness          = 0.1
        this.state.emissive           = { r: 0, g: 0, b: 0 }
        this.state.emissiveIntensity  = 0
        this.state.opacity            = 1.0
        this.state.transparent        = false
        this.state.clearcoat          = 0
        this.state.transmission       = 0
        this.state.ior                = 1.5
        this._swapMaterial('MeshStandardMaterial')
        this._refreshPBRVisibility('MeshStandardMaterial')
    }
}