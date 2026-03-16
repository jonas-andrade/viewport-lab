import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class CameraPanel {
    constructor(folder, { camera, renderer, controls }) {
        this.camera   = camera
        this.renderer = renderer
        this.controls = controls
        this.folder   = folder

        this.state = {
            type:   'Perspective',
            fov:    60,
            near:   0.1,
            far:    1000,
            zoom:   1,
            preset: 'Default',
        }

        this._build()
    }

    _build() {
        const f = this.folder

        // label 'Projection' → bate com LabelMap.projection
        f.addBinding(this.state, 'type', {
            label: 'Projection',
            options: {
                'PerspectiveCamera':   'Perspective',
                'OrthographicCamera':  'Orthographic',
            }
        }).on('change', ({ value }) => { this._applyType(value) })

        f.addBlade({ view: 'separator' })

        // label 'FOV' → bate com LabelMap.fov
        this._fovBinding = f.addBinding(this.state, 'fov', {
            label: 'FOV', min: 10, max: 120, step: 1
        }).on('change', ({ value }) => {
            if (this.camera.isPerspectiveCamera) {
                this.camera.fov = value
                this.camera.updateProjectionMatrix()
            }
        })

        // label 'Zoom' → bate com LabelMap.zoom
        f.addBinding(this.state, 'zoom', {
            label: 'Zoom', min: 0.1, max: 5, step: 0.01
        }).on('change', ({ value }) => {
            this.camera.zoom = value
            this.camera.updateProjectionMatrix()
        })

        f.addBlade({ view: 'separator' })

        // label 'Near Clip' → bate com LabelMap.near_clip
        f.addBinding(this.state, 'near', {
            label: 'Near Clip', min: 0.01, max: 10, step: 0.01
        }).on('change', ({ value }) => {
            this.camera.near = value
            this.camera.updateProjectionMatrix()
        })

        // label 'Far Clip' → bate com LabelMap.far_clip
        f.addBinding(this.state, 'far', {
            label: 'Far Clip', min: 10, max: 5000, step: 1
        }).on('change', ({ value }) => {
            this.camera.far = value
            this.camera.updateProjectionMatrix()
        })

        f.addBlade({ view: 'separator' })

        // label 'View Preset' → bate com LabelMap.view_preset
        f.addBinding(this.state, 'preset', {
            label: 'View Preset',
            options: {
                'Default (3/4)':  'Default',
                'Front':          'Front',
                'Top':            'Top',
                'Side (Right)':   'Side',
                'Isometric':      'Isometric',
            }
        }).on('change', ({ value }) => { this._applyPreset(value) })

        f.addBlade({ view: 'separator' })
        f.addButton({ title: '⟳ Reset Camera' }).on('click', () => {
            this._applyPreset('Default')
        })
    }

    // ── Troca de câmera ────────────────────────────────────────────────────
    // Bug corrigido: após criar newControls, atualiza TANTO this.controls
    // quanto window.__vlab.controls para que o loop de animação use o correto.
    // _applyPreset é chamado DEPOIS para garantir que usa os novos controles.
    _applyType(type) {
        const canvas = this.renderer.domElement
        const aspect = canvas.clientWidth / canvas.clientHeight

        const oldPos    = this.camera.position.clone()
        const oldTarget = this.controls.target.clone()

        // Dispose dos controles antigos antes de qualquer coisa
        this.controls.dispose()

        let newCam

        if (type === 'Orthographic') {
            const s = 3
            newCam = new THREE.OrthographicCamera(
                -s * aspect, s * aspect,
                s, -s,
                this.state.near,
                this.state.far
            )
        } else {
            newCam = new THREE.PerspectiveCamera(
                this.state.fov,
                aspect,
                this.state.near,
                this.state.far
            )
        }

        newCam.position.copy(oldPos)
        newCam.zoom = this.state.zoom
        newCam.updateProjectionMatrix()

        const newControls = new OrbitControls(newCam, canvas)
        newControls.enableDamping  = true
        newControls.dampingFactor  = 0.05
        newControls.target.copy(oldTarget)
        newControls.update()

        // Atualiza referências locais E globais atomicamente
        this.camera   = newCam
        this.controls = newControls

        window.__vlab.camera   = newCam
        window.__vlab.controls = newControls
    }

    _applyPreset(name) {
        // Usa sempre this.controls (já atualizado por _applyType se chamado antes)
        const target = this.controls.target.clone()

        const presets = {
            Default:    { x: 0,   y: 1.5, z: 4     },
            Front:      { x: 0,   y: 0,   z: 5     },
            Top:        { x: 0,   y: 6,   z: 0.001 },
            Side:       { x: 5,   y: 0,   z: 0     },
            Isometric:  { x: 4,   y: 4,   z: 4     },
        }

        const pos = presets[name] ?? presets.Default
        this.camera.position.set(pos.x, pos.y, pos.z)
        this.camera.lookAt(target)
        this.controls.update()
    }

    reset() {
        this.state.fov    = 60
        this.state.near   = 0.1
        this.state.far    = 1000
        this.state.zoom   = 1
        this.state.preset = 'Default'

        if (!this.camera.isPerspectiveCamera) {
            this._applyType('Perspective')
        }

        this.state.type = 'Perspective'
        this.camera.fov  = 60
        this.camera.near = 0.1
        this.camera.far  = 1000
        this.camera.zoom = 1
        this.camera.updateProjectionMatrix()
        this._applyPreset('Default')
    }
}