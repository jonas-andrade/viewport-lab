import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

export class RendererPanel {
    constructor(folder, { renderer, scene }) {
        this.renderer = renderer
        this.scene = scene
        this.folder = folder

        this.state = {
            toneMapping: 'ACESFilmicToneMapping',
            exposure: 1.0,
            pixelRatio: window.devicePixelRatio,
            antialias: true,
            outputSpace: 'sRGB',
        }

        this._build()
    }

    _build() {
        const f = this.folder

        // ── Tone Mapping ───────────────────────────────────────────────────────
        // ToneMapping: converte cores HDR (alto alcance dinâmico) pra SDR (tela)
        // É como a "revelação" da foto — define o contraste e saturação geral
        this._addLabel(f,
            'Tone Mapping',
            'Como cores HDR são convertidas pra exibição na tela'
        )

        f.addBinding(this.state, 'toneMapping', {
            label: 'Algorithm',
            options: {
                [LabelMap.tone_linear.label]: 'LinearToneMapping',
                [LabelMap.tone_reinhard.label]: 'ReinhardToneMapping',
                [LabelMap.tone_cineon.label]: 'CineonToneMapping',
                [LabelMap.tone_aces.label]: 'ACESFilmicToneMapping',
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
            // needsUpdate força recompilação dos shaders com o novo tone mapping
            this.scene.traverse(obj => {
                if (obj.material) obj.material.needsUpdate = true
            })
        })

        // ── Exposure ───────────────────────────────────────────────────────────
        // Exposure: brilho global da cena — como ISO/abertura em fotografia
        // 1.0 = neutro, <1 = subexposto (escuro), >1 = superexposto (claro)
        this._addLabel(f,
            LabelMap.tone_exposure.label,
            LabelMap.tone_exposure.desc
        )

        f.addBinding(this.state, 'exposure', {
            label: 'Exposure',
            min: 0, max: 5, step: 0.01
        }).on('change', ({ value }) => {
            this.renderer.toneMappingExposure = value
        })

        f.addBlade({ view: 'separator' })

        // ── Pixel Ratio ────────────────────────────────────────────────────────
        // pixelRatio: quantos pixels físicos por pixel CSS
        // devicePixelRatio em telas Retina = 2 ou 3 — mais nítido, mais pesado
        // Reduzir pra 1 em cenas pesadas melhora performance
        this._addLabel(f,
            LabelMap.pixel_ratio.label,
            LabelMap.pixel_ratio.desc
        )

        f.addBinding(this.state, 'pixelRatio', {
            label: 'Pixel Ratio',
            options: {
                '0.5  (performance)': 0.5,
                '1.0  (padrão)': 1.0,
                '1.5': 1.5,
                '2.0  (retina)': 2.0,
                'Nativo (DPR)': window.devicePixelRatio,
            }
        }).on('change', ({ value }) => {
            this.renderer.setPixelRatio(value)
            // Força redimensionamento do canvas com o novo ratio
            const canvas = this.renderer.domElement
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        })

        f.addBlade({ view: 'separator' })

        // ── Output Color Space ─────────────────────────────────────────────────
        // Color Space: espaço de cor do output final
        // sRGB: padrão da web — corrige a gamma da tela
        // Linear: sem correção — cores matematicamente lineares
        this._addLabel(f,
            'Output Color Space',
            'Espaço de cor do output — sRGB é o padrão correto para a web'
        )

        f.addBinding(this.state, 'outputSpace', {
            label: 'Color Space',
            options: {
                'sRGB (padrão)': 'sRGB',
                'Linear': 'Linear',
            }
        }).on('change', ({ value }) => {
            this.renderer.outputColorSpace = value === 'sRGB'
                ? THREE.SRGBColorSpace
                : THREE.LinearSRGBColorSpace
            this.scene.traverse(obj => {
                if (obj.material) obj.material.needsUpdate = true
            })
        })

        f.addBlade({ view: 'separator' })

        // ── Shadow Map Info ────────────────────────────────────────────────────
        // Lembrete visual — o tipo do shadow map é controlado no painel Shadow
        this._addLabel(f,
            'Shadow Map',
            'Tipo de shadow map — configurado no painel Shadow'
        )

        // Monitor read-only do tipo atual
        const shadowState = { type: 'PCFSoftShadowMap' }
        const shadowTypes = {
            [THREE.BasicShadowMap]: 'BasicShadowMap',
            [THREE.PCFShadowMap]: 'PCFShadowMap',
            [THREE.PCFSoftShadowMap]: 'PCFSoftShadowMap',
            [THREE.VSMShadowMap]: 'VSMShadowMap',
        }

        f.addBinding(shadowState, 'type', {
            label: 'Current',
            readonly: true,
        })

        // Atualiza o monitor a cada vez que a folder é expandida
        f.on('fold', () => {
            shadowState.type = shadowTypes[this.renderer.shadowMap.type] ?? 'Unknown'
        })
    }

    _addLabel(folder, title, desc) {
        const el = document.createElement('div')
        el.className = 'vlab-label'
        el.textContent = `${title} — ${desc}`
        folder.element.appendChild(el)
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

        this.scene.traverse(obj => {
            if (obj.material) obj.material.needsUpdate = true
        })
    }
}