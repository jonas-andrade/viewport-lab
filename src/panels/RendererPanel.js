import * as THREE from 'three'

export class RendererPanel {
    constructor(folder, { renderer, scene }) {
        this.renderer = renderer
        this.scene = scene
        this.folder = folder
        this.state = {
            toneMapping: 'ACESFilmicToneMapping',
            exposure: 1.0,
            pixelRatio: window.devicePixelRatio,
            outputSpace: 'sRGB',
        }
        this._build()
    }

    _build() {
        const f = this.folder

        f.addBinding(this.state, 'toneMapping', {
            label: 'Tone Mapping',
            options: {
                'LinearToneMapping': 'LinearToneMapping',
                'ReinhardToneMapping': 'ReinhardToneMapping',
                'CineonToneMapping': 'CineonToneMapping',
                'ACESFilmicToneMapping': 'ACESFilmicToneMapping',
                'NoToneMapping': 'NoToneMapping',
            }
        }).on('change', ({ value }) => {
            const map = {
                NoToneMapping: THREE.NoToneMapping,
                LinearToneMapping: THREE.LinearToneMapping,
                ReinhardToneMapping: THREE.ReinhardToneMapping,
                CineonToneMapping: THREE.CineonToneMapping,
                ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
            }
            this.renderer.toneMapping = map[value]
            this.scene.traverse(obj => { if (obj.material) obj.material.needsUpdate = true })
        })

        f.addBinding(this.state, 'exposure', {
            label: 'Exposure', min: 0, max: 5, step: 0.01
        }).on('change', ({ value }) => { this.renderer.toneMappingExposure = value })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'pixelRatio', {
            label: 'Pixel Ratio',
            options: {
                '0.5': 0.5, '1.0': 1.0, '1.5': 1.5, '2.0': 2.0,
                'Native': window.devicePixelRatio,
            }
        }).on('change', ({ value }) => {
            this.renderer.setPixelRatio(value)
            const canvas = this.renderer.domElement
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'outputSpace', {
            label: 'Color Space',
            options: { 'sRGB': 'sRGB', 'Linear': 'Linear' }
        }).on('change', ({ value }) => {
            this.renderer.outputColorSpace = value === 'sRGB'
                ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace
            this.scene.traverse(obj => { if (obj.material) obj.material.needsUpdate = true })
        })
    }

    reset() {
        this.state.toneMapping = 'ACESFilmicToneMapping'
        this.state.exposure = 1.0
        this.state.pixelRatio = window.devicePixelRatio
        this.state.outputSpace = 'sRGB'
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.0
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.scene.traverse(obj => { if (obj.material) obj.material.needsUpdate = true })
    }
}