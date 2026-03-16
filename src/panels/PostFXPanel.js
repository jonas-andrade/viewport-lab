import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'
import { LabelMap } from '../utils/LabelMap.js'

export class PostFXPanel {
    constructor(folder, { renderer, scene, camera }) {
        this.renderer = renderer
        this.scene = scene
        this.camera = camera
        this.folder = folder

        // EffectComposer: substitui o renderer.render() direto
        // Ele encadeia passes — cada um lê o frame anterior e escreve o próximo
        this.composer = new EffectComposer(renderer)

        // RenderPass: primeiro pass sempre — renderiza a cena normal
        this.renderPass = new RenderPass(scene, camera)
        this.composer.addPass(this.renderPass)

        // Passes opcionais — criados mas desativados por padrão
        this._initPasses()

        // Substitui o render do loop pelo composer
        // O main.js vai checar window.__vlab.composer se existir
        window.__vlab.composer = this.composer

        this.state = {
            bloom: false,
            bloomThreshold: 0.8,
            bloomStrength: 0.5,
            bloomRadius: 0.4,
            ssao: false,
            ssaoRadius: 8,
            ssaoMinDistance: 0.005,
            ssaoMaxDistance: 0.1,
            film: false,
            filmNoise: 0.35,
            filmLines: 0,
            filmGrayscale: false,
            fxaa: false,
            vignette: false,
            vignetteOffset: 1.0,
            vignetteDarkness: 1.0,
        }

        this._build()
    }

    _initPasses() {
        const size = new THREE.Vector2(
            this.renderer.domElement.clientWidth,
            this.renderer.domElement.clientHeight
        )

        // ── Bloom ─────────────────────────────────────────────────────────────
        // UnrealBloomPass: brilho que vaza em áreas claras — efeito HDR
        // threshold: luminosidade mínima pra acionar o bloom
        // strength: intensidade do brilho
        // radius: quanto o brilho se espalha
        this.bloomPass = new UnrealBloomPass(size, 0.5, 0.4, 0.8)
        this.bloomPass.enabled = false
        this.composer.addPass(this.bloomPass)

        // ── SSAO ──────────────────────────────────────────────────────────────
        // Screen Space Ambient Occlusion: escurece frestas e cantos em tempo real
        // Simula a oclusão de luz ambiente por geometria próxima
        this.ssaoPass = new SSAOPass(this.scene, this.camera, size.x, size.y)
        this.ssaoPass.enabled = false
        this.composer.addPass(this.ssaoPass)

        // ── Film Grain ────────────────────────────────────────────────────────
        // FilmPass: ruído de filme + linhas de scan — imita granulação analógica
        this.filmPass = new FilmPass(0.35, false)
        this.filmPass.enabled = false
        this.composer.addPass(this.filmPass)

        // ── FXAA ──────────────────────────────────────────────────────────────
        // FXAA: Fast Approximate Anti-Aliasing — suaviza bordas serrilhadas
        // É um shader pass — opera sobre a imagem já renderizada
        this.fxaaPass = new ShaderPass(FXAAShader)
        this.fxaaPass.enabled = false
        this.fxaaPass.uniforms['resolution'].value.set(
            1 / size.x,
            1 / size.y
        )
        this.composer.addPass(this.fxaaPass)

        // ── Vignette ──────────────────────────────────────────────────────────
        // Vignette: escurece bordas da tela — direciona o olhar pro centro
        this.vignettePass = new ShaderPass(VignetteShader)
        this.vignettePass.enabled = false
        this.composer.addPass(this.vignettePass)
    }

    _build() {
        const f = this.folder

        this._addLabel(f,
            'Post Processing',
            'Efeitos aplicados sobre o frame já renderizado — como filtros de foto'
        )

        f.addBlade({ view: 'separator' })

        // ── Bloom ─────────────────────────────────────────────────────────────
        const bloomFolder = f.addFolder({ title: LabelMap.bloom.label, expanded: false })
        this._addLabel(bloomFolder, LabelMap.bloom.label, LabelMap.bloom.desc)

        bloomFolder.addBinding(this.state, 'bloom', { label: 'Enabled' })
            .on('change', ({ value }) => {
                this.bloomPass.enabled = value
            })

        bloomFolder.addBinding(this.state, 'bloomThreshold', {
            label: LabelMap.bloom_threshold.label,
            min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            this.bloomPass.threshold = value
        })

        bloomFolder.addBinding(this.state, 'bloomStrength', {
            label: LabelMap.bloom_strength.label,
            min: 0, max: 3, step: 0.01
        }).on('change', ({ value }) => {
            this.bloomPass.strength = value
        })

        bloomFolder.addBinding(this.state, 'bloomRadius', {
            label: 'Radius — raio de espalhamento do brilho',
            min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            this.bloomPass.radius = value
        })

        // ── SSAO ──────────────────────────────────────────────────────────────
        const ssaoFolder = f.addFolder({ title: LabelMap.ssao.label, expanded: false })
        this._addLabel(ssaoFolder, LabelMap.ssao.label, LabelMap.ssao.desc)

        ssaoFolder.addBinding(this.state, 'ssao', { label: 'Enabled' })
            .on('change', ({ value }) => {
                this.ssaoPass.enabled = value
            })

        ssaoFolder.addBinding(this.state, 'ssaoRadius', {
            label: 'Radius — raio de busca de oclusão',
            min: 1, max: 32, step: 0.1
        }).on('change', ({ value }) => {
            this.ssaoPass.radius = value
        })

        ssaoFolder.addBinding(this.state, 'ssaoMinDistance', {
            label: 'Min Distance',
            min: 0.001, max: 0.02, step: 0.001
        }).on('change', ({ value }) => {
            this.ssaoPass.minDistance = value
        })

        ssaoFolder.addBinding(this.state, 'ssaoMaxDistance', {
            label: 'Max Distance',
            min: 0.01, max: 0.3, step: 0.001
        }).on('change', ({ value }) => {
            this.ssaoPass.maxDistance = value
        })

        // ── Film Grain ────────────────────────────────────────────────────────
        const filmFolder = f.addFolder({ title: LabelMap.film_grain.label, expanded: false })
        this._addLabel(filmFolder, LabelMap.film_grain.label, LabelMap.film_grain.desc)

        filmFolder.addBinding(this.state, 'film', { label: 'Enabled' })
            .on('change', ({ value }) => {
                this.filmPass.enabled = value
            })

        filmFolder.addBinding(this.state, 'filmNoise', {
            label: 'Noise Intensity',
            min: 0, max: 1, step: 0.01
        }).on('change', ({ value }) => {
            this.filmPass.uniforms.nIntensity.value = value
        })

        filmFolder.addBinding(this.state, 'filmGrayscale', {
            label: 'Grayscale — converte a cena pra preto e branco'
        }).on('change', ({ value }) => {
            this.filmPass.uniforms.grayscale.value = value ? 1 : 0
        })

        // ── FXAA ──────────────────────────────────────────────────────────────
        const fxaaFolder = f.addFolder({ title: LabelMap.fxaa.label, expanded: false })
        this._addLabel(fxaaFolder, LabelMap.fxaa.label, LabelMap.fxaa.desc)

        fxaaFolder.addBinding(this.state, 'fxaa', { label: 'Enabled' })
            .on('change', ({ value }) => {
                this.fxaaPass.enabled = value
            })

        // ── Vignette ──────────────────────────────────────────────────────────
        const vigFolder = f.addFolder({ title: LabelMap.vignette.label, expanded: false })
        this._addLabel(vigFolder, LabelMap.vignette.label, LabelMap.vignette.desc)

        vigFolder.addBinding(this.state, 'vignette', { label: 'Enabled' })
            .on('change', ({ value }) => {
                this.vignettePass.enabled = value
            })

        vigFolder.addBinding(this.state, 'vignetteOffset', {
            label: 'Offset — quanto a vinheta avança pro centro',
            min: 0, max: 2, step: 0.01
        }).on('change', ({ value }) => {
            this.vignettePass.uniforms['offset'].value = value
        })

        vigFolder.addBinding(this.state, 'vignetteDarkness', {
            label: 'Darkness — intensidade do escurecimento',
            min: 0, max: 2, step: 0.01
        }).on('change', ({ value }) => {
            this.vignettePass.uniforms['darkness'].value = value
        })
    }

    // Precisa ser chamado quando o canvas muda de tamanho
    resize(width, height) {
        this.composer.setSize(width, height)
        this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height)
    }
    _addLabel(folder, title, desc) {
        const el = document.createElement('div')
        el.className = 'vlab-label'
        el.textContent = `${title} — ${desc}`
        folder.element.appendChild(el)
    }
    reset() {
        this.state.bloom = false
        this.state.bloomThreshold = 0.8
        this.state.bloomStrength = 0.5
        this.state.bloomRadius = 0.4
        this.state.ssao = false
        this.state.film = false
        this.state.filmNoise = 0.35
        this.state.filmGrayscale = false
        this.state.fxaa = false
        this.state.vignette = false
        this.state.vignetteOffset = 1.0
        this.state.vignetteDarkness = 1.0

        this.bloomPass.enabled = false
        this.ssaoPass.enabled = false
        this.filmPass.enabled = false
        this.fxaaPass.enabled = false
        this.vignettePass.enabled = false

        this.bloomPass.threshold = 0.8
        this.bloomPass.strength = 0.5
        this.bloomPass.radius = 0.4
    }
}