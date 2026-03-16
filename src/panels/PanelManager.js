import * as THREE from 'three'
import { Pane } from 'tweakpane'
import { GeometryPanel }    from './GeometryPanel.js'
import { SurfacePanel }     from './SurfacePanel.js'
import { LightingPanel }    from './LightingPanel.js'
import { ShadowPanel }      from './ShadowPanel.js'
import { EnvironmentPanel } from './EnvironmentPanel.js'
import { CameraPanel }      from './CameraPanel.js'

export class PanelManager {
  constructor({ scene, camera, renderer, mesh, material, controls }) {
    this.scene    = scene
    this.camera   = camera
    this.renderer = renderer
    this.mesh     = mesh
    this.material = material
    this.controls = controls

    this.toggles = {
      geometry:    true,
      surface:     true,
      lighting:    true,
      shadow:      true,
      environment: true,
    }

    this._savedMaterial = null
    this._defaultBg     = '#1a1a1a'

    this.container = document.getElementById('panel')
    this.pane      = new Pane({ container: this.container, title: '' })
    this.panels    = {}

    this._setupFolders()
    this._applyTheme()
  }

  _setupFolders() {
    const ctx = {
      scene:    this.scene,
      camera:   this.camera,
      renderer: this.renderer,
      mesh:     this.mesh,
      material: this.material,
      controls: this.controls,
    }

    const makeFolder = (title, icon, key, onToggle) => {
      const f = this.pane.addFolder({ title: `${icon}  ${title}`, expanded: false })
      const toggleState = { enabled: true }
      f.addBinding(toggleState, 'enabled', { label: '⏻ Active' })
       .on('change', ({ value }) => {
         this.toggles[key] = value
         onToggle(value)
       })
      f.addBlade({ view: 'separator' })
      return f
    }

    const folders = {
      geometry: makeFolder('Geometry', '⬡', 'geometry', (on) => {
        this.mesh.visible = on
      }),

      surface: makeFolder('Surface', '◈', 'surface', (on) => {
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

      lighting: makeFolder('Lighting', '☀', 'lighting', (on) => {
        this.scene.traverse(obj => {
          if (obj.isLight) obj.visible = on
        })
      }),

      shadow: makeFolder('Shadow', '◐', 'shadow', (on) => {
        this.renderer.shadowMap.enabled = on
        this.scene.traverse(obj => {
          if (obj.material) obj.material.needsUpdate = true
        })
      }),

      environment: makeFolder('Environment', '🌐', 'environment', (on) => {
        this.scene.background = new THREE.Color(on ? this._defaultBg : '#000000')
        if (!on) this.scene.fog = null
      }),

      camera:   this.pane.addFolder({ title: '⊙  Camera',   expanded: false }),
      postfx:   this.pane.addFolder({ title: '✦  Post FX',  expanded: false }),
      renderer: this.pane.addFolder({ title: '▣  Renderer', expanded: false }),
    }

    // ── Instancia todos os painéis ─────────────────────────────────────────
    this.panels.geometry    = new GeometryPanel(folders.geometry,       ctx)
    this.panels.surface     = new SurfacePanel(folders.surface,         ctx)
    this.panels.lighting    = new LightingPanel(folders.lighting,       ctx)
    this.panels.shadow      = new ShadowPanel(folders.shadow,           ctx)
    this.panels.environment = new EnvironmentPanel(folders.environment, ctx)
    this.panels.camera      = new CameraPanel(folders.camera,           ctx)

    this.folders = folders
  }

  _applyTheme() {
    const style = document.createElement('style')
    style.textContent = `
      .tp-dfwv {
        width: 100% !important;
        --tp-base-background-color: #141414;
        --tp-base-shadow-color: transparent;
        --tp-blade-focus-box-shadow-color: #4f8ef755;
        --tp-button-background-color: #1e1e1e;
        --tp-button-background-color-active: #2a2a2a;
        --tp-button-background-color-focus: #222;
        --tp-button-background-color-hover: #1e1e1e;
        --tp-button-foreground-color: #e0e0e0;
        --tp-container-background-color: #191919;
        --tp-container-background-color-active: #1e1e1e;
        --tp-container-background-color-focus: #191919;
        --tp-container-background-color-hover: #191919;
        --tp-container-foreground-color: #e0e0e0;
        --tp-groove-foreground-color: #2a2a2a;
        --tp-input-background-color: #1a1a1a;
        --tp-input-background-color-active: #222;
        --tp-input-background-color-focus: #1e1e1e;
        --tp-input-background-color-hover: #1e1e1e;
        --tp-input-foreground-color: #e0e0e0;
        --tp-label-foreground-color: #888;
        --tp-monitor-background-color: #111;
        --tp-monitor-foreground-color: #4f8ef7;
        --tp-plugin-background-color: #141414;
        --tp-plugin-foreground-color: #e0e0e0;
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

    this.scene.traverse(obj => {
      if (obj.isLight) obj.visible = true
    })

    Object.values(this.panels).forEach(p => p.reset?.())
  }
}