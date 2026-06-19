# 4D Plotter

Interactive WebGL visualizer for topological spaces that are naturally handled as
embeddings in `R^4` and then projected, sliced, or color-encoded for inspection
in ordinary `R^3`.

## Current MVP

- Vite + TypeScript + Three.js application.
- Shared 4D rotation and projection layer.
- Parametric surface sampler for 4D objects.
- Initial object set:
  - Klein bottle as a smooth `R^4` embedding.
  - Real projective plane using a Veronese-style `R^4` embedding.
  - `S^3` cross-section controlled by a `w` slice slider.
  - Tesseract boundary graph as a 4D wireframe.
- Controls for:
  - Perspective or orthographic `R^4 -> R^3` projection.
  - 4D camera distance.
  - Scale.
  - Six coordinate-plane rotations: `xy`, `xz`, `xw`, `yz`, `yw`, `zw`.
  - Surface sampling resolution.
  - Wireframe and automatic 4D rotation.

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Architecture

```text
src/math       4D vectors, rotations, projection helpers
src/topology   Topological object definitions and mesh sampling
src/rendering  Three.js renderer and color mapping
src/app.ts     UI state, controls, object selection
```

The key design choice is to keep the mathematical definition in `R^4` separate
from the `R^3` rendering path. Projection artifacts such as apparent
self-intersections can then be examined by rotating through the fourth
coordinate or by reading the color-coded `w` coordinate.
