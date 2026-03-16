import * as THREE from 'three'

export class EnvironmentPanel {
    constructor(folder, { scene }) {
        this.scene = scene
        this.folder = folder
        this.state = {
            bgColor: { r: 26, g: 26, b: 26 },
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

        f.addBinding(this.state, 'bgColor', {
            label: 'Background',
            color: { type: 'float' }
        }).on('change', ({ value }) => {
            this.scene.background = new THREE.Color(value.r / 255, value.g / 255, value.b / 255)
        })

        f.addBlade({ view: 'separator' })

        f.addBinding(this.state, 'fogType', {
            label: 'Fog Type',
            options: { 'None': 'None', 'Fog (Linear)': 'Linear', 'FogExp2': 'Exponential' }
        }).on('change', ({ value }) => {
            this._applyFog(value)
            this._refreshFogControls(value)
        })

        this._fog_folder = f.addFolder({ title: 'Fog Settings', expanded: true })
        this._buildFogControls(this._fog_folder)
        this._fog_folder.hidden = true
    }

    _buildFogControls(f) {
        f.addBinding(this.state, 'fogColor', { label: 'Fog Color', color: { type: 'float' } })
            .on('change', () => { this._applyFog(this.state.fogType) })

        this._nearBinding = f.addBinding(this.state, 'fogNear', {
            label: 'Fog Near', min: 0, max: 50, step: 0.1
        }).on('change', () => { this._applyFog(this.state.fogType) })

        this._farBinding = f.addBinding(this.state, 'fogFar', {
            label: 'Fog Far', min: 0, max: 200, step: 0.1
        }).on('change', () => { this._applyFog(this.state.fogType) })

        this._densityBinding = f.addBinding(this.state, 'fogDensity', {
            label: 'Fog Density', min: 0, max: 0.2, step: 0.001
        }).on('change', () => { this._applyFog(this.state.fogType) })
    }

    _applyFog(type) {
        const c = this.state.fogColor
        const color = new THREE.Color(c.r / 255, c.g / 255, c.b / 255)
        switch (type) {
            case 'None': this.scene.fog = null; break
            case 'Linear': this.scene.fog = new THREE.Fog(color, this.state.fogNear, this.state.fogFar); break
            case 'Exponential': this.scene.fog = new THREE.FogExp2(color, this.state.fogDensity); break
        }
    }

    _refreshFogControls(type) {
        if (!this._fog_folder) return
        this._fog_folder.hidden = type === 'None'
        if (this._nearBinding) this._nearBinding.hidden = type !== 'Linear'
        if (this._farBinding) this._farBinding.hidden = type !== 'Linear'
        if (this._densityBinding) this._densityBinding.hidden = type !== 'Exponential'
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