import { Pane } from 'tweakpane'

export class PanelManager {
    constructor({ scene, camera, renderer, mesh, material, controls }) {
        // Guarda referências de tudo que os painéis precisam manipular
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.mesh = mesh
        this.material = material
        this.controls = controls

        // container: o elemento #panel no DOM
        this.container = document.getElementById('panel')

        // Instancia o Tweakpane apontando pro container
        // O Tweakpane vai injetar o painel dentro desse elemento
        this.pane = new Pane({ container: this.container, title: '' })

        this._setupFolders()
        this._applyTheme()
    }

    _setupFolders() {
        // Cria cada categoria como uma folder colapsada
        // expanded: false = começa fechada

        this.folders = {
            geometry: this.pane.addFolder({ title: '⬡  Geometry', expanded: false }),
            surface: this.pane.addFolder({ title: '◈  Surface', expanded: false }),
            lighting: this.pane.addFolder({ title: '☀  Lighting', expanded: false }),
            shadow: this.pane.addFolder({ title: '◐  Shadow', expanded: false }),
            environment: this.pane.addFolder({ title: '⬡  Environment', expanded: false }),
            camera: this.pane.addFolder({ title: '⊙  Camera', expanded: false }),
            postfx: this.pane.addFolder({ title: '✦  Post FX', expanded: false }),
            renderer: this.pane.addFolder({ title: '▣  Renderer', expanded: false }),
        }
    }

    _applyTheme() {
        // Tweakpane usa CSS variables para theming
        // Sobrescreve as variáveis padrão dele para combinar com nosso dark theme
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

    // Método público — cada painel vai chamar isso pra pegar a folder dele
    getFolder(name) {
        return this.folders[name]
    }
}