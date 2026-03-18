# VLab — Three.js Scene Lab

A hands-on environment for testing and understanding Three.js in practice. Built for developers and 3D students who want to experiment with the engine without writing boilerplate.
## Preview

![preview](./demo.gif)

<video 
  src="https://raw.githubusercontent.com/jonas-andrade/viewport-lab/main/public/demo.mp4"
  autoplay 
  loop 
  muted 
  playsinline 
  width="700">
</video>

---

## What you can explore

- Geometries and mesh subdivision
- PBR materials — roughness, metalness, emissive, transmission, clearcoat
- Texture slots — albedo, normal, roughness, AO, displacement and emissive maps
- Lighting types — Ambient, Directional, Point, Spot and Hemisphere
- Shadow map algorithms — Basic, PCF, PCFSoft and VSM
- Post-processing — Bloom, SSAO, FXAA, Vignette and Film Grain
- Camera projections — Perspective and Orthographic
- Renderer settings — Tone mapping, exposure and pixel ratio

Every label in the panel is clickable and shows a plain-language explanation of the term, with a direct link to the official Three.js documentation.

## Stack

Three.js · Vite · Tweakpane

## Getting started

```bash
npm install
npm run dev
```
