import * as THREE from 'three'
import { LabelMap } from '../utils/LabelMap.js'

const GEOMETRIES = {
  'Box':          () => new THREE.BoxGeometry(1.5, 1.5, 1.5),
  'Sphere':       () => new THREE.SphereGeometry(0.9, 32, 32),
  'Torus':        () => new THREE.TorusGeometry(0.7, 0.3, 16, 60),
  'Cone':         () => new THREE.ConeGeometry(0.9, 1.8, 32),
  'Cylinder':     () => new THREE.CylinderGeometry(0.7, 0.7, 1.8, 32),
  'Plane':        () => new THREE.PlaneGeometry(2, 2, 1, 1),
  'Capsule':      () => new THREE.CapsuleGeometry(0.5, 1, 8, 16),
  'TorusKnot':    () => new THREE.TorusKnotGeometry(0.6, 0.2, 128, 16),
  'Icosahedron':  () => new THREE.IcosahedronGeometry(1, 0),
}

export class GeometryPanel {
  constructor(folder, { mesh }) {
    this.mesh   = mesh
    this.folder = folder

    this.state = {
      geometry:     'Box',
      wireframe:    false,
      flatShading:  false,
      segments:     1,
      rotateX:      0,
      rotateY:      0,
      rotateZ:      0,
      scaleUniform: 1,
    }

    this._build()
  }

  _build() {
    const f = this.folder

    this._addLabel(f, 'Geometry Type', 'Forma base do objeto na cena')
    f.addBinding(this.state, 'geometry', {
      label: 'Shape',
      options: Object.fromEntries(Object.keys(GEOMETRIES).map(k => [k, k]))
    }).on('change', ({ value }) => {
      this._swapGeometry(value)
    })

    this._addLabel(f, 'Segments', 'Subdivide a malha — mais segmentos = mais suave')
    f.addBinding(this.state, 'segments', {
      label: 'Segments ×',
      min: 1, max: 8, step: 1
    }).on('change', () => {
      this._swapGeometry(this.state.geometry)
    })

    f.addBlade({ view: 'separator' })

    this._addLabel(f, 'Display Mode', 'Como a malha é exibida visualmente')
    f.addBinding(this.state, 'wireframe', {
      label: LabelMap.wireframe.label
    }).on('change', ({ value }) => {
      this.mesh.material.wireframe = value
    })

    f.addBinding(this.state, 'flatShading', {
      label: LabelMap.flat_shading.label
    }).on('change', ({ value }) => {
      this.mesh.material.flatShading = value
      this.mesh.material.needsUpdate = true
    })

    f.addBlade({ view: 'separator' })

    this._addLabel(f, 'Transform', 'Rotação e escala do objeto')
    f.addBinding(this.state, 'rotateX', {
      label: 'Rotate X', min: -Math.PI, max: Math.PI, step: 0.01
    }).on('change', ({ value }) => { this.mesh.rotation.x = value })

    f.addBinding(this.state, 'rotateY', {
      label: 'Rotate Y', min: -Math.PI, max: Math.PI, step: 0.01
    }).on('change', ({ value }) => { this.mesh.rotation.y = value })

    f.addBinding(this.state, 'rotateZ', {
      label: 'Rotate Z', min: -Math.PI, max: Math.PI, step: 0.01
    }).on('change', ({ value }) => { this.mesh.rotation.z = value })

    f.addBlade({ view: 'separator' })

    f.addBinding(this.state, 'scaleUniform', {
      label: 'Scale', min: 0.1, max: 3, step: 0.01
    }).on('change', ({ value }) => {
      this.mesh.scale.setScalar(value)
    })
  }

  _swapGeometry(name) {
    const seg = this.state.segments
    let geo

    switch (name) {
      case 'Box':
        geo = new THREE.BoxGeometry(1.5, 1.5, 1.5, seg, seg, seg); break
      case 'Sphere':
        geo = new THREE.SphereGeometry(0.9, 8 * seg, 8 * seg); break
      case 'Torus':
        geo = new THREE.TorusGeometry(0.7, 0.3, 4 * seg, 12 * seg); break
      case 'Cone':
        geo = new THREE.ConeGeometry(0.9, 1.8, 8 * seg, seg); break
      case 'Cylinder':
        geo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 8 * seg, seg); break
      case 'Plane':
        geo = new THREE.PlaneGeometry(2, 2, seg, seg); break
      case 'Capsule':
        geo = new THREE.CapsuleGeometry(0.5, 1, 2 * seg, 8 * seg); break
      case 'TorusKnot':
        geo = new THREE.TorusKnotGeometry(0.6, 0.2, 32 * seg, 8 * seg); break
      case 'Icosahedron':
        geo = new THREE.IcosahedronGeometry(1, seg - 1); break
      default:
        geo = GEOMETRIES[name]?.() ?? new THREE.BoxGeometry(1.5, 1.5, 1.5)
    }

    this.mesh.geometry.dispose()
    this.mesh.geometry = geo
  }

  _addLabel(folder, title, desc) {
    folder.addBlade({
      view: 'text',
      label: '',
      parse: v => v,
      value: `${title} — ${desc}`,
    })
  }

  reset() {
    this.state.geometry     = 'Box'
    this.state.wireframe    = false
    this.state.flatShading  = false
    this.state.segments     = 1
    this.state.rotateX      = 0
    this.state.rotateY      = 0
    this.state.rotateZ      = 0
    this.state.scaleUniform = 1

    this.mesh.geometry.dispose()
    this.mesh.geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
    this.mesh.material.wireframe   = false
    this.mesh.material.flatShading = false
    this.mesh.material.needsUpdate = true
    this.mesh.rotation.set(0, 0, 0)
    this.mesh.scale.setScalar(1)
  }
}