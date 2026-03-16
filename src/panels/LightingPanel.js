import * as THREE from 'three'

const LIGHT_TYPES = ['AmbientLight','DirectionalLight','PointLight','SpotLight','HemisphereLight']

export class LightingPanel {
    constructor(folder, { scene }) {
        this.scene = scene
        this.folder = folder
        this.lights = []
        this._counter = 0
        this.addState = { type: 'DirectionalLight' }
        this._build()
    }

    _build() {
        const f = this.folder

        f.addBinding(this.addState, 'type', {
            label: 'Light Type',
            options: Object.fromEntries(LIGHT_TYPES.map(k => [k, k]))
        })

        f.addButton({ title: '+ Add Light' }).on('click', () => { this._addLight(this.addState.type) })
        f.addBlade({ view: 'separator' })
        this._lightsContainer = f
    }

    _addLight(typeName) {
        this._counter++
        const label = `${typeName.replace('Light', '')} #${this._counter}`
        const { light, helper } = this._createLight(typeName)
        this.scene.add(light)
        if (helper) this.scene.add(helper)

        const state = {
            color: { r: 1, g: 1, b: 1 },
            intensity: light.intensity,
            visible: true,
            helper: true,
            posX: light.position?.x ?? 0,
            posY: light.position?.y ?? 3,
            posZ: light.position?.z ?? 0,
            angle: light.angle ?? Math.PI / 6,
            penumbra: light.penumbra ?? 0,
            groundColor: { r: 0.27, g: 0.27, b: 0.27 },
        }

        const lf = this._lightsContainer.addFolder({ title: `☀ ${label}`, expanded: false })

        lf.addBinding(state, 'visible', { label: 'Visible' })
            .on('change', ({ value }) => { light.visible = value })

        lf.addBinding(state, 'helper', { label: 'Show Helper' })
            .on('change', ({ value }) => { if (helper) helper.visible = value })

        lf.addBinding(state, 'color', { label: 'Color', color: { type: 'float' } })
            .on('change', ({ value }) => {
                light.color.setRGB(value.r, value.g, value.b)
                if (helper?.update) helper.update()
            })

        if (typeName === 'HemisphereLight') {
            lf.addBinding(state, 'groundColor', { label: 'Ground Color', color: { type: 'float' } })
                .on('change', ({ value }) => { light.groundColor.setRGB(value.r, value.g, value.b) })
        }

        lf.addBinding(state, 'intensity', { label: 'Intensity', min: 0, max: 10, step: 0.01 })
            .on('change', ({ value }) => {
                light.intensity = value
                if (helper?.update) helper.update()
            })

        if (!['AmbientLight', 'HemisphereLight'].includes(typeName)) {
            lf.addBlade({ view: 'separator' })
            lf.addBinding(state, 'posX', { label: 'Position X', min: -10, max: 10, step: 0.01 })
                .on('change', ({ value }) => { light.position.x = value; if (helper?.update) helper.update() })
            lf.addBinding(state, 'posY', { label: 'Position Y', min: -10, max: 10, step: 0.01 })
                .on('change', ({ value }) => { light.position.y = value; if (helper?.update) helper.update() })
            lf.addBinding(state, 'posZ', { label: 'Position Z', min: -10, max: 10, step: 0.01 })
                .on('change', ({ value }) => { light.position.z = value; if (helper?.update) helper.update() })
        }

        if (typeName === 'SpotLight') {
            lf.addBlade({ view: 'separator' })
            lf.addBinding(state, 'angle', { label: 'Angle', min: 0.05, max: Math.PI / 2, step: 0.01 })
                .on('change', ({ value }) => { light.angle = value; if (helper?.update) helper.update() })
            lf.addBinding(state, 'penumbra', { label: 'Penumbra', min: 0, max: 1, step: 0.01 })
                .on('change', ({ value }) => { light.penumbra = value })
        }

        lf.addBlade({ view: 'separator' })
        lf.addButton({ title: '✕ Remove' }).on('click', () => { this._removeLight(light, helper, lf) })

        this.lights.push({ light, helper, folder: lf, state })
    }

    _createLight(typeName) {
        let light, helper
        switch (typeName) {
            case 'AmbientLight':
                light = new THREE.AmbientLight(0xffffff, 0.5); helper = null; break
            case 'DirectionalLight':
                light = new THREE.DirectionalLight(0xffffff, 1)
                light.position.set(5, 8, 5); light.castShadow = true
                helper = new THREE.DirectionalLightHelper(light, 1); break
            case 'PointLight':
                light = new THREE.PointLight(0xffffff, 1, 20); light.decay = 2
                light.position.set(0, 3, 0)
                helper = new THREE.PointLightHelper(light, 0.3); break
            case 'SpotLight':
                light = new THREE.SpotLight(0xffffff, 1)
                light.position.set(0, 5, 0); light.angle = Math.PI / 6
                light.penumbra = 0.1; light.castShadow = true
                helper = new THREE.SpotLightHelper(light); break
            case 'HemisphereLight':
                light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
                helper = new THREE.HemisphereLightHelper(light, 0.5); break
            default:
                light = new THREE.AmbientLight(0xffffff, 0.5); helper = null
        }
        return { light, helper }
    }

    _removeLight(light, helper, folder) {
        this.scene.remove(light)
        if (helper) this.scene.remove(helper)
        light.dispose?.(); helper?.dispose?.()
        folder.dispose()
        this.lights = this.lights.filter(e => e.light !== light)
    }

    reset() {
        ;[...this.lights].forEach(({ light, helper, folder }) => { this._removeLight(light, helper, folder) })
        this.lights = []
        this._counter = 0
    }
}