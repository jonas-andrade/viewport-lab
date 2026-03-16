import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'

export class PostFXPanel {
    constructor(folder, { renderer, scene, camera }) {
        this.renderer = renderer
        this.scene = scene
        this.camera = camera
        this.folder = folder

        this.composer = new EffectComposer(renderer)
        this.renderPass = new RenderPass(scene, camera)
        this.composer.addPass(this.renderPass)
        this._initPasses()
        window.__vlab.composer = this.composer

        this.state = {
            bloom: false, bloomThreshold: 0.8, bloomStrength: 0.5, bloomRadius: 0.4,
            ssao: false, ssaoRadius: 8, ssaoMinDistance: 0.005, ssaoMaxDistance: 0.1,
            film: false, filmNoise: 0.35, filmGrayscale: false,
            fxaa: false,
            vignette: false, vignetteOffset: 1.0, vignetteDarkness: 1.0,
        }
        this._build()
    }

    _initPasses() {
        const size = new THREE.Vector2(
            this.renderer.domElement.clientWidth,
            this.renderer.domElement.clientHeight
        )
        this.bloomPass = new UnrealBloomPass(size, 0.5, 0.4, 0.8)
        this.bloomPass.enabled = false
        this.composer.addPass(this.bloomPass)

        this.ssaoPass = new SSAOPass(this.scene, this.camera, size.x, size.y)
        this.ssaoPass.enabled = false
        this.composer.addPass(this.ssaoPass)

        this.filmPass = new FilmPass(0.35, false)
        this.filmPass.enabled = false
        this.composer.addPass(this.filmPass)

        this.fxaaPass = new ShaderPass(FXAAShader)
        this.fxaaPass.enabled = false
        this.fxaaPass.uniforms['resolution'].value.set(1 / size.x, 1 / size.y)
        this.composer.addPass(this.fxaaPass)

        this.vignettePass = new ShaderPass(VignetteShader)
        this.vignettePass.enabled = false
        this.composer.addPass(this.vignettePass)
    }

    _build() {
        const f = this.folder

        // Bloom
        const bloomF = f.addFolder({ title: 'Bloom', expanded: false })
        bloomF.addBinding(this.state, 'bloom', { label: 'Enable' })
            .on('change', ({ value }) => { this.bloomPass.enabled = value })
        bloomF.addBinding(this.state, 'bloomThreshold', { label: 'Bloom Threshold', min: 0, max: 1, step: 0.01 })
            .on('change', ({ value }) => { this.bloomPass.threshold = value })
        bloomF.addBinding(this.state, 'bloomStrength', { label: 'Bloom Strength', min: 0, max: 3, step: 0.01 })
            .on('change', ({ value }) => { this.bloomPass.strength = value })
        bloomF.addBinding(this.state, 'bloomRadius', { label: 'Bloom Radius', min: 0, max: 1, step: 0.01 })
            .on('change', ({ value }) => { this.bloomPass.radius = value })

        // SSAO
        const ssaoF = f.addFolder({ title: 'SSAO', expanded: false })
        ssaoF.addBinding(this.state, 'ssao', { label: 'Enable' })
            .on('change', ({ value }) => { this.ssaoPass.enabled = value })
        ssaoF.addBinding(this.state, 'ssaoRadius', { label: 'SSAO Radius', min: 1, max: 32, step: 0.1 })
            .on('change', ({ value }) => { this.ssaoPass.radius = value })
        ssaoF.addBinding(this.state, 'ssaoMinDistance', { label: 'Min Distance', min: 0.001, max: 0.02, step: 0.001 })
            .on('change', ({ value }) => { this.ssaoPass.minDistance = value })
        ssaoF.addBinding(this.state, 'ssaoMaxDistance', { label: 'Max Distance', min: 0.01, max: 0.3, step: 0.001 })
            .on('change', ({ value }) => { this.ssaoPass.maxDistance = value })

        // Film Grain
        const filmF = f.addFolder({ title: 'Film Grain', expanded: false })
        filmF.addBinding(this.state, 'film', { label: 'Enable' })
            .on('change', ({ value }) => { this.filmPass.enabled = value })
        filmF.addBinding(this.state, 'filmNoise', { label: 'Noise Intensity', min: 0, max: 1, step: 0.01 })
            .on('change', ({ value }) => { this.filmPass.uniforms.nIntensity.value = value })
        filmF.addBinding(this.state, 'filmGrayscale', { label: 'Grayscale' })
            .on('change', ({ value }) => { this.filmPass.uniforms.grayscale.value = value ? 1 : 0 })

        // FXAA
        const fxaaF = f.addFolder({ title: 'FXAA', expanded: false })
        fxaaF.addBinding(this.state, 'fxaa', { label: 'Enable' })
            .on('change', ({ value }) => { this.fxaaPass.enabled = value })

        // Vignette
        const vigF = f.addFolder({ title: 'Vignette', expanded: false })
        vigF.addBinding(this.state, 'vignette', { label: 'Enable' })
            .on('change', ({ value }) => { this.vignettePass.enabled = value })
        vigF.addBinding(this.state, 'vignetteOffset', { label: 'Vignette Offset', min: 0, max: 2, step: 0.01 })
            .on('change', ({ value }) => { this.vignettePass.uniforms['offset'].value = value })
        vigF.addBinding(this.state, 'vignetteDarkness', { label: 'Vignette Darkness', min: 0, max: 2, step: 0.01 })
            .on('change', ({ value }) => { this.vignettePass.uniforms['darkness'].value = value })
    }

    resize(width, height) {
        this.composer.setSize(width, height)
        this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height)
    }

    reset() {
        this.state.bloom = false; this.state.bloomThreshold = 0.8
        this.state.bloomStrength = 0.5; this.state.bloomRadius = 0.4
        this.state.ssao = false; this.state.film = false
        this.state.filmNoise = 0.35; this.state.filmGrayscale = false
        this.state.fxaa = false; this.state.vignette = false
        this.state.vignetteOffset = 1.0; this.state.vignetteDarkness = 1.0
        this.bloomPass.enabled = false; this.ssaoPass.enabled = false
        this.filmPass.enabled = false; this.fxaaPass.enabled = false
        this.vignettePass.enabled = false
        this.bloomPass.threshold = 0.8; this.bloomPass.strength = 0.5; this.bloomPass.radius = 0.4
    }
}