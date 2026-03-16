import * as THREE from 'three'
import { Pane } from 'tweakpane'
import { GeometryPanel }    from './GeometryPanel.js'
import { SurfacePanel }     from './SurfacePanel.js'
import { LightingPanel }    from './LightingPanel.js'
import { ShadowPanel }      from './ShadowPanel.js'
import { EnvironmentPanel } from './EnvironmentPanel.js'
import { CameraPanel }      from './CameraPanel.js'
import { RendererPanel }    from './RendererPanel.js'
import { PostFXPanel }      from './PostFXPanel.js'

// ── Ícones SVG inline — um por seção ─────────────────────────────────────────
// Cada ícone é desenhado num viewBox 16×16, traço de 1.4px, stroke-linecap round
const ICONS = {
  // Geometry: cubo em perspectiva com aresta tracejada
  geometry: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M8 2V14M2 5.5L8 9L14 5.5" stroke="currentColor" stroke-width="1.3" stroke-dasharray="1.8 1.2"/>
  </svg>`,

  // Surface: círculo com gradiente de rugosidade indicado por linhas paralelas
  surface: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M4.5 10.5C5.5 9 6.5 8.5 8 8.5C9.5 8.5 10.5 7.5 11.5 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="11.5" cy="4.5" r="1.2" fill="currentColor" opacity="0.7"/>
  </svg>`,

  // Lighting: ponto de luz com raios assimétricos (não sol clichê)
  lighting: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="7" r="2.2" stroke="currentColor" stroke-width="1.3"/>
    <path d="M8 1.5V3M8 11V12.5M1.5 7H3M13 7H14.5M3.5 3.5L4.5 4.5M11.5 9.5L12.5 10.5M3.5 10.5L4.5 9.5M11.5 4.5L12.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M6 13.5C6 13.5 6.5 14.5 8 14.5C9.5 14.5 10 13.5 10 13.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,

  // Shadow: objeto com sombra projetada em perspectiva
  shadow: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/>
    <path d="M6 9L4.5 13H11.5L10 9" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <line x1="4.5" y1="13" x2="11.5" y2="13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.4"/>
  </svg>`,

  // Environment: horizonte com névoa — linha de chão + arco de céu + pontos de fog
  environment: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 11C4 11 5 9 8 9C11 9 12 11 14.5 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M3 8C4.5 6.5 6 6 8 6C10 6 11.5 6.5 13 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <path d="M5 5C5.8 4 6.8 3.5 8 3.5C9.2 3.5 10.2 4 11 5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.35"/>
    <line x1="1.5" y1="13" x2="14.5" y2="13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,

  // Camera: corpo da câmera + lente + visor, linhas limpas
  camera: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="6.5" cy="8.5" r="2" stroke="currentColor" stroke-width="1.2"/>
    <path d="M11.5 7L14.5 5.5V11.5L11.5 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="3" y="3" width="3" height="2" rx="0.6" stroke="currentColor" stroke-width="1.1"/>
  </svg>`,

  // Post FX: duas molduras sobrepostas com brilho — composição de passes
  postfx: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="3.5" width="9" height="9" rx="1.2" stroke="currentColor" stroke-width="1.3"/>
    <rect x="5.5" y="5.5" width="9" height="9" rx="1.2" stroke="currentColor" stroke-width="1.3" opacity="0.45"/>
    <path d="M7 7L9 9M9 7L7 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="13" cy="3" r="1.5" fill="currentColor" opacity="0.7"/>
  </svg>`,

  // Renderer: chip com núcleo brilhando — GPU/processamento
  renderer: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <rect x="6" y="6" width="4" height="4" rx="0.6" stroke="currentColor" stroke-width="1.1"/>
    <path d="M6 1.5V3.5M10 1.5V3.5M6 12.5V14.5M10 12.5V14.5M1.5 6H3.5M1.5 10H3.5M12.5 6H14.5M12.5 10H14.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
}

// Monta o título com o SVG inline + texto
function folderTitle(icon, text) {
  // Tweakpane usa o campo title como textContent — não aceita HTML diretamente
  // Injetamos o SVG após a criação via DOM
  return `__ICON:${icon}__${text}`
}

function injectIcons(containerEl) {
  containerEl.querySelectorAll('.tp-fldv_t').forEach(el => {
    const raw = el.textContent || ''
    const match = raw.match(/^__ICON:(\w+)__(.+)$/)
    if (!match) return
    const [, iconKey, label] = match
    const svg = ICONS[iconKey]
    if (!svg) return
    el.innerHTML = `
      <span class="vlab-folder-icon" style="
        display:inline-flex;align-items:center;justify-content:center;
        width:20px;height:20px;border-radius:5px;
        background:rgba(255,255,255,0.04);margin-right:8px;flex-shrink:0;
        color:#7a7a7a;vertical-align:middle;
      ">${svg}</span>
      <span style="vertical-align:middle">${label}</span>
    `
  })
}

export class PanelManager {
  constructor({ scene, camera, renderer, mesh, material, controls }) {
    this.scene    = scene
    this.camera   = camera
    this.renderer = renderer
    this.mesh     = mesh
    this.material = material
    this.controls = controls

    this.toggles = {
      geometry: true, surface: true, lighting: true,
      shadow: true, environment: true,
    }

    this._savedMaterial = null
    this._defaultBg     = '#1a1a1a'

    this.container = document.getElementById('panel')
    this.pane      = new Pane({ container: this.container, title: '' })
    this.panels    = {}

    this._injectPanelHeader()
    this._setupFolders()
    this._applyTheme()

    // Injeta SVGs após o Tweakpane renderizar os títulos
    requestAnimationFrame(() => injectIcons(this.container))
  }

  _injectPanelHeader() {
    const wrap = document.getElementById('panel-wrap')
    if (!wrap || document.getElementById('panel-header')) return

    const header = document.createElement('div')
    header.id = 'panel-header'
    header.innerHTML = `
      <div id="panel-header-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="#4f8ef7" opacity="0.8"/>
          <rect x="9" y="2" width="5" height="5" rx="1" fill="#4f8ef7" opacity="0.5"/>
          <rect x="2" y="9" width="5" height="5" rx="1" fill="#4f8ef7" opacity="0.5"/>
          <rect x="9" y="9" width="5" height="5" rx="1" fill="#4f8ef7" opacity="0.3"/>
        </svg>
      </div>
      <div id="panel-header-text">
        <div id="panel-header-title">VLab Controls</div>
        <div id="panel-header-sub">3D Scene Editor</div>
      </div>
    `
    wrap.insertBefore(header, document.getElementById('panel'))
  }

  _setupFolders() {
    const ctx = {
      scene: this.scene, camera: this.camera, renderer: this.renderer,
      mesh: this.mesh, material: this.material, controls: this.controls,
    }

    const makeFolder = (iconKey, title, key, onToggle) => {
      const f = this.pane.addFolder({
        title: folderTitle(iconKey, title),
        expanded: false
      })
      const toggleState = { enabled: true }
      f.addBinding(toggleState, 'enabled', { label: 'Enable' })
       .on('change', ({ value }) => {
         this.toggles[key] = value
         onToggle(value)
       })
      f.addBlade({ view: 'separator' })
      return f
    }

    const folders = {
      geometry: makeFolder('geometry', 'Geometry', 'geometry', (on) => {
        this.mesh.visible = on
      }),

      surface: makeFolder('surface', 'Surface', 'surface', (on) => {
        if (!on) {
          this._savedMaterial = this.mesh.material
          this.mesh.material  = new THREE.MeshNormalMaterial()
        } else {
          if (this._savedMaterial) {
            this.mesh.material.dispose()
            this.mesh.material  = this._savedMaterial
            this._savedMaterial = null
          }
        }
      }),

      lighting: makeFolder('lighting', 'Lighting', 'lighting', (on) => {
        this.scene.traverse(obj => { if (obj.isLight) obj.visible = on })
      }),

      shadow: makeFolder('shadow', 'Shadow', 'shadow', (on) => {
        this.renderer.shadowMap.enabled = on
        this.scene.traverse(obj => { if (obj.material) obj.material.needsUpdate = true })
      }),

      environment: makeFolder('environment', 'Environment', 'environment', (on) => {
        this.scene.background = new THREE.Color(on ? this._defaultBg : '#000000')
        if (!on) this.scene.fog = null
      }),

      camera:   this.pane.addFolder({ title: folderTitle('camera',   'Camera'),   expanded: false }),
      postfx:   this.pane.addFolder({ title: folderTitle('postfx',   'Post FX'),  expanded: false }),
      renderer: this.pane.addFolder({ title: folderTitle('renderer', 'Renderer'), expanded: false }),
    }

    this.panels.geometry    = new GeometryPanel(folders.geometry,       ctx)
    this.panels.surface     = new SurfacePanel(folders.surface,         ctx)
    this.panels.lighting    = new LightingPanel(folders.lighting,       ctx)
    this.panels.shadow      = new ShadowPanel(folders.shadow,           ctx)
    this.panels.environment = new EnvironmentPanel(folders.environment, ctx)
    this.panels.camera      = new CameraPanel(folders.camera,           ctx)
    this.panels.renderer    = new RendererPanel(folders.renderer,       ctx)
    this.panels.postfx      = new PostFXPanel(folders.postfx,           ctx)

    this.folders = folders
  }

  _applyTheme() {
    const style = document.createElement('style')
    style.textContent = `
      .tp-dfwv {
        width: 100% !important;
        --tp-base-background-color:              #131313;
        --tp-base-shadow-color:                  transparent;
        --tp-blade-focus-box-shadow-color:       #4f8ef740;
        --tp-button-background-color:            #1c1c1c;
        --tp-button-background-color-active:     #272727;
        --tp-button-background-color-focus:      #202020;
        --tp-button-background-color-hover:      #222222;
        --tp-button-foreground-color:            #d0d0d0;
        --tp-container-background-color:         #181818;
        --tp-container-background-color-active:  #1e1e1e;
        --tp-container-background-color-focus:   #181818;
        --tp-container-background-color-hover:   #1a1a1a;
        --tp-container-foreground-color:         #e0e0e0;
        --tp-groove-foreground-color:            #282828;
        --tp-input-background-color:             #1a1a1a;
        --tp-input-background-color-active:      #222;
        --tp-input-background-color-focus:       #1e1e1e;
        --tp-input-background-color-hover:       #1e1e1e;
        --tp-input-foreground-color:             #e0e0e0;
        --tp-label-foreground-color:             #707070;
        --tp-monitor-background-color:           #111;
        --tp-monitor-foreground-color:           #4f8ef7;
        --tp-plugin-background-color:            #141414;
        --tp-plugin-foreground-color:            #e0e0e0;
      }
    `
    document.head.appendChild(style)
  }

  getFolder(name) { return this.folders[name] }

  resetAll() {
    this.mesh.visible               = true
    this.renderer.shadowMap.enabled = true
    this.scene.background           = new THREE.Color(this._defaultBg)
    this.scene.fog                  = null

    if (this._savedMaterial) {
      this.mesh.material.dispose()
      this.mesh.material  = this._savedMaterial
      this._savedMaterial = null
    }

    this.scene.traverse(obj => { if (obj.isLight) obj.visible = true })
    Object.values(this.panels).forEach(p => p.reset?.())
  }
}