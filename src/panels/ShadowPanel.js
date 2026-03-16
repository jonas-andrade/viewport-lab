import * as THREE from 'three'

export class ShadowPanel {
    constructor(folder, { renderer, scene, mesh }) {
        this.renderer = renderer
        this.scene = scene
        this.mesh = mesh
        this.folder = folder
        this.state = {
            mapType: 'PCFSoftShadowMap',
            castShadow: true,
            receiveShadow: true,
            bias: 0,
            mapSize: 1024,
        }
        this._build()
    }

    _build() {
        const f = this.folder

        f.addBinding(this.state, 'mapType', {
            label: 'Shadow Map',
            options: {
                'BasicShadowMap': 'BasicShadowMap',
                'PCFShadowMap': 'PCFShadowMap',
                'PCFSoftShadowMap': 'PCFSoftShadowMap',
                'VSMShadowMap': 'VSMShadowMap',
            }
        }).on('change', ({ value }) => {
            const map = {
                BasicShadowMap: THREE.BasicShadowMap,
                PCFShadowMap: THREE.PCFShadowMap,
                PCFSoftShadowMap: THREE.PCFSoftShadowMap,
                VSMShadowMap: THREE.VSMShadowMap,
            }
            this.renderer.shadowMap.type = map[value]
            this.scene.traverse(obj => { if (obj.material) obj.material.needsUpdate = true })
        })

        f.addBinding(this.state, 'mapSize', {
            label: 'Map Size',
            options: {
                '256': 256, '512': 512, '1024': 1024, '2048': 2048, '4096': 4096,
            }
        }).on('change', ({ value }) => {
            this.scene.traverse(obj => {
                if (obj.isLight && obj.castShadow) {
                    obj.shadow.mapSize.set(value, value)
                    obj.shadow.map?.dispose()
                    obj.shadow.map = null
                }
            })
        })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'castShadow', { label: 'Cast Shadow' })
            .on('change', ({ value }) => { this.mesh.castShadow = value })

        f.addBinding(this.state, 'receiveShadow', { label: 'Receive Shadow' })
            .on('change', ({ value }) => { this.mesh.receiveShadow = value })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'bias', {
            label: 'Shadow Bias', min: -0.01, max: 0.01, step: 0.0001
        }).on('change', ({ value }) => {
            this.scene.traverse(obj => {
                if (obj.isLight && obj.castShadow) obj.shadow.bias = value
            })
        })
    }

    reset() {
        this.state.mapType = 'PCFSoftShadowMap'
        this.state.castShadow = true
        this.state.receiveShadow = true
        this.state.bias = 0
        this.state.mapSize = 1024
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.scene.traverse(obj => {
            if (obj.isLight && obj.castShadow) {
                obj.shadow.bias = 0
                obj.shadow.mapSize.set(1024, 1024)
                obj.shadow.map?.dispose()
                obj.shadow.map = null
            }
            if (obj.material) obj.material.needsUpdate = true
        })
    }
}