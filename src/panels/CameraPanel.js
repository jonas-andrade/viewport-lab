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

        f.addBinding(this.state, 'type', {
            label: 'Projection',
            options: {
                'PerspectiveCamera':  'Perspective',
                'OrthographicCamera': 'Orthographic',
            }
        }).on('change', ({ value }) => { this._applyType(value) })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'fov', {
            label: 'FOV', min: 10, max: 120, step: 1
        }).on('change', ({ value }) => {
            if (this.camera.isPerspectiveCamera) {
                this.camera.fov = value
                this.camera.updateProjectionMatrix()
            }
        })

        f.addBinding(this.state, 'zoom', {
            label: 'Zoom', min: 0.1, max: 5, step: 0.01
        }).on('change', ({ value }) => {
            this.camera.zoom = value
            this.camera.updateProjectionMatrix()
        })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'near', {
            label: 'Near Clip', min: 0.01, max: 10, step: 0.01
        }).on('change', ({ value }) => {
            this.camera.near = value
            this.camera.updateProjectionMatrix()
        })

        f.addBinding(this.state, 'far', {
            label: 'Far Clip', min: 10, max: 5000, step: 1
        }).on('change', ({ value }) => {
            this.camera.far = value
            this.camera.updateProjectionMatrix()
        })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'preset', {
            label: 'View Preset',
            options: {
                'Default (3/4)': 'Default',
                'Front':         'Front',
                'Top':           'Top',
                'Side (Right)':  'Side',
                'Isometric':     'Isometric',
            }
        }).on('change', ({ value }) => { this._applyPreset(value) })

        f.addBlade({ view: 'separator' })

        f.addButton({ title: '⟳ Reset Camera' }).on('click', () => {
            this._applyPreset('Default')
        })
    }

    _applyType(type) {
        const canvas = this.renderer.domElement
        const w      = canvas.clientWidth  || 800
        const h      = canvas.clientHeight || 600
        const aspect = w / h

        const oldPos    = this.camera.position.clone()
        const oldTarget = this.controls.target.clone()

        let newCam
        if (type === 'Orthographic') {
            const s = 3
            newCam  = new THREE.OrthographicCamera(
                -s * aspect, s * aspect, s, -s,
                this.state.near, this.state.far
            )
        } else {
            newCam = new THREE.PerspectiveCamera(
                this.state.fov, aspect,
                this.state.near, this.state.far
            )
        }

        newCam.position.copy(oldPos)
        newCam.zoom = this.state.zoom
        newCam.updateProjectionMatrix()

        // Reutiliza os OrbitControls existentes trocando apenas a câmera interna
        // OrbitControls expõe .object para isso — sem dispose, sem novo objeto,
        // sem risco de event listeners duplicados ou destruídos no meio do frame
        this.controls.object = newCam
        this.controls.target.copy(oldTarget)
        this.controls.update()

        // Atualiza referências locais e globais
        this.camera          = newCam
        window.__vlab.camera = newCam
        // window.__vlab.controls continua o mesmo objeto — apenas .object mudou
    }

    _applyPreset(name) {
        const presets = {
            Default:   { x: 0, y: 1.5, z: 4     },
            Front:     { x: 0, y: 0,   z: 5     },
            Top:       { x: 0, y: 6,   z: 0.001 },
            Side:      { x: 5, y: 0,   z: 0     },
            Isometric: { x: 4, y: 4,   z: 4     },
        }
        const pos = presets[name] ?? presets.Default
        this.camera.position.set(pos.x, pos.y, pos.z)
        this.camera.lookAt(this.controls.target)
        this.controls.update()
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
        } else {
            this.camera.fov    = 60
            this.camera.aspect = this.renderer.domElement.clientWidth /
                                 this.renderer.domElement.clientHeight
            this.camera.near   = 0.1
            this.camera.far    = 1000
            this.camera.zoom   = 1
            this.camera.updateProjectionMatrix()
        }

        this._applyPreset('Default')
    }
}