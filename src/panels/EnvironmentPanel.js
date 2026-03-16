import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

export class EnvironmentPanel {
    constructor(folder, { scene }) {
        this.scene = scene
        this.folder = folder

        this.state = {
            bgColor: { r: 26, g: 26, b: 26 },  // #1a1a1a
            fogType: 'None',
            fogColor: { r: 26, g: 26, b: 26 },
            fogNear: 5,
            fogFar: 20,
            fogDensity: 0.02,
        }

        this._fog_folder = null
        this._build()
    }

    _build() {
        const f = this.folder

        // ── Background Color ───────────────────────────────────────────────────
        this._addLabel(f,
            LabelMap.bg_color.label,
            LabelMap.bg_color.desc
        )

        f.addBinding(this.state, 'bgColor', {
            label: 'Background',
            color: { type: 'float' }
        }).on('change', ({ value }) => {
            this.scene.background = new THREE.Color(
                value.r / 255,
                value.g / 255,
                value.b / 255
            )
        })

        f.addBlade({ view: 'separator' })

        // ── Fog Type ───────────────────────────────────────────────────────────
        // Fog: névoa que faz objetos distantes desaparecerem gradualmente
        // Dois tipos: Linear (começa e termina em distâncias fixas)
        //             Exponential (densidade cresce com a distância)
        this._addLabel(f,
            'Fog',
            'Névoa na cena — objetos distantes somem gradualmente'
        )

        f.addBinding(this.state, 'fogType', {
            label: 'Fog Type',
            options: {
                'None': 'None',
                [LabelMap.fog_linear.label]: 'Linear',
                [LabelMap.fog_exp.label]: 'Exponential',
            }
        }).on('change', ({ value }) => {
            this._applyFog(value)
            this._refreshFogControls(value)
        })

        // ── Fog Controls ───────────────────────────────────────────────────────
        this._fog_folder = f.addFolder({ title: 'Fog Settings', expanded: true })
        this._buildFogControls(this._fog_folder)

        // Começa escondido — fog é None por padrão
        this._fog_folder.hidden = true
    }

    _buildFogControls(f) {
        f.addBinding(this.state, 'fogColor', {
            label: 'Fog Color',
            color: { type: 'float' }
        }).on('change', () => { this._applyFog(this.state.fogType) })

        // Near/Far: só visível no modo Linear
        this._nearBinding = f.addBinding(this.state, 'fogNear', {
            label: 'Near', min: 0, max: 50, step: 0.1
        }).on('change', () => { this._applyFog(this.state.fogType) })

        this._farBinding = f.addBinding(this.state, 'fogFar', {
            label: 'Far', min: 0, max: 200, step: 0.1
        }).on('change', () => { this._applyFog(this.state.fogType) })

        // Density: só visível no modo Exponential
        this._densityBinding = f.addBinding(this.state, 'fogDensity', {
            label: LabelMap.fog_density.label,
            min: 0, max: 0.2, step: 0.001
        }).on('change', () => { this._applyFog(this.state.fogType) })
    }

    _applyFog(type) {
        const c = this.state.fogColor
        const color = new THREE.Color(c.r / 255, c.g / 255, c.b / 255)

        switch (type) {
            case 'None':
                this.scene.fog = null
                break
            case 'Linear':
                // Fog(color, near, far) — névoa começa em near e termina em far
                this.scene.fog = new THREE.Fog(color, this.state.fogNear, this.state.fogFar)
                break
            case 'Exponential':
                // FogExp2(color, density) — névoa exponencial, mais realista
                this.scene.fog = new THREE.FogExp2(color, this.state.fogDensity)
                break
        }
    }

    _refreshFogControls(type) {
        if (!this._fog_folder) return

        // Mostra/esconde a folder de controles de fog
        this._fog_folder.hidden = type === 'None'

        // Near/Far só fazem sentido no fog Linear
        if (this._nearBinding) this._nearBinding.hidden = type !== 'Linear'
        if (this._farBinding) this._farBinding.hidden = type !== 'Linear'
        // Density só faz sentido no fog Exponential
        if (this._densityBinding) this._densityBinding.hidden = type !== 'Exponential'
    }

    _addLabel(folder, title, desc) {
        const el = document.createElement('div')
        el.className = 'vlab-label'
        el.textContent = `${title} — ${desc}`
        folder.element.appendChild(el)
    }
    reset() {
        this.state.bgColor = { r: 26, g: 26, b: 26 }
        this.state.fogType = 'None'
        this.state.fogNear = 5
        this.state.fogFar = 20
        this.state.fogDensity = 0.02

        this.scene.background = new THREE.Color('#1a1a1a')
        this.scene.fog = null

        this._refreshFogControls('None')
    }
}