import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

export class ShadowPanel {
    constructor(folder, { renderer, scene, mesh }) {
        this.renderer = renderer
        this.scene = scene
        this.mesh = mesh
        this.folder = folder

        this.state = {
            enabled: true,
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

        // ── Shadow Map Type ────────────────────────────────────────────────────
        this._addLabel(f,
            'Shadow Map Type',
            'Algoritmo usado para calcular sombras — afeta qualidade e performance'
        )

        f.addBinding(this.state, 'mapType', {
            label: 'Algorithm',
            options: {
                [LabelMap.shadow_basic.label]: 'BasicShadowMap',
                [LabelMap.shadow_pcf.label]: 'PCFShadowMap',
                [LabelMap.shadow_pcfsoft.label]: 'PCFSoftShadowMap',
                [LabelMap.shadow_vsm.label]: 'VSMShadowMap',
            }
        }).on('change', ({ value }) => {
            const map = {
                BasicShadowMap: THREE.BasicShadowMap,
                PCFShadowMap: THREE.PCFShadowMap,
                PCFSoftShadowMap: THREE.PCFSoftShadowMap,
                VSMShadowMap: THREE.VSMShadowMap,
            }
            this.renderer.shadowMap.type = map[value]
            // needsUpdate força recompilação dos materiais com o novo algoritmo
            this.scene.traverse(obj => {
                if (obj.material) obj.material.needsUpdate = true
            })
        })

        f.addBlade({ view: 'separator' })

        // ── Shadow Map Resolution ──────────────────────────────────────────────
        // mapSize: resolução do mapa de sombra em pixels
        // Valores maiores = sombras mais nítidas mas mais pesadas na GPU
        this._addLabel(f,
            'Shadow Map Size',
            'Resolução do mapa de sombra — maior = mais nítido, mais pesado'
        )

        f.addBinding(this.state, 'mapSize', {
            label: 'Resolution',
            options: {
                '256  (baixa)': 256,
                '512': 512,
                '1024 (padrão)': 1024,
                '2048 (alta)': 2048,
                '4096 (ultra)': 4096,
            }
        }).on('change', ({ value }) => {
            // Aplica a nova resolução em todas as luzes que projetam sombra
            this.scene.traverse(obj => {
                if (obj.isLight && obj.castShadow) {
                    obj.shadow.mapSize.set(value, value)
                    // map = null força o Three.js a recriar o shadow map
                    obj.shadow.map?.dispose()
                    obj.shadow.map = null
                }
            })
        })

        f.addBlade({ view: 'separator' })

        // ── Cast / Receive ─────────────────────────────────────────────────────
        this._addLabel(f,
            'Object Shadow',
            'Controla se o objeto principal projeta e/ou recebe sombra'
        )

        f.addBinding(this.state, 'castShadow', {
            label: LabelMap.cast_shadow.label
        }).on('change', ({ value }) => {
            this.mesh.castShadow = value
        })

        f.addBinding(this.state, 'receiveShadow', {
            label: LabelMap.receive_shadow.label
        }).on('change', ({ value }) => {
            this.mesh.receiveShadow = value
        })

        f.addBlade({ view: 'separator' })

        // ── Shadow Bias ────────────────────────────────────────────────────────
        // bias: offset aplicado ao cálculo de sombra
        // Sem bias: shadow acne — manchas escuras na própria superfície do objeto
        // Bias positivo demais: peter panning — sombra flutua longe do objeto
        this._addLabel(f,
            LabelMap.shadow_bias.label,
            LabelMap.shadow_bias.desc
        )

        f.addBinding(this.state, 'bias', {
            label: 'Bias',
            min: -0.01, max: 0.01, step: 0.0001
        }).on('change', ({ value }) => {
            this.scene.traverse(obj => {
                if (obj.isLight && obj.castShadow) {
                    obj.shadow.bias = value
                }
            })
        })
    }

    _addLabel(folder, title, desc) {
        const el = document.createElement('div')
        el.className = 'vlab-label'
        el.textContent = `${title} — ${desc}`
        folder.element.appendChild(el)
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