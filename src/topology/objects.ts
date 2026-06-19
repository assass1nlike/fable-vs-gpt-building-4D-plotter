import { clamp } from '../math/vec4';
import type { TopologyObject, TopologyParameters, WireMesh4D } from './types';
import { makeParametricSurface } from './mesh';

const tau = Math.PI * 2;

export const topologyObjects: TopologyObject[] = [
  {
    id: 'klein',
    name: 'Klein Bottle',
    symbol: 'K',
    kind: 'surface',
    summary: 'Closed non-orientable surface; its familiar 3D form self-intersects only because one dimension is missing.',
    details:
      'Sampled as a smooth R4 embedding. The projected crossing can be inspected by changing xw/yw/zw rotations or by using w color.',
    defaultScale: 1.05,
    makeGeometry: ({ uSegments, vSegments }: TopologyParameters) =>
      makeParametricSurface(uSegments, vSegments, (u01, v01) => {
        const u = tau * u01;
        const v = tau * v01;
        const r = 1.35 + 0.38 * Math.cos(v);
        return [
          r * Math.cos(u),
          r * Math.sin(u),
          0.38 * Math.sin(v) * Math.cos(u / 2),
          0.38 * Math.sin(v) * Math.sin(u / 2),
        ];
      }),
  },
  {
    id: 'rp2',
    name: 'Real Projective Plane',
    symbol: 'RP2',
    kind: 'surface',
    summary: 'The sphere with antipodal points identified; it cannot embed in R3 but has a standard Veronese embedding in R4.',
    details:
      'This uses four coordinates from the Veronese surface. Opposite points on the parameter sphere land on the same point.',
    defaultScale: 1.75,
    makeGeometry: ({ uSegments, vSegments }: TopologyParameters) =>
      makeParametricSurface(uSegments, vSegments, (u01, v01) => {
        const theta = tau * u01;
        const phi = Math.PI * v01;
        const sx = Math.sin(phi) * Math.cos(theta);
        const sy = Math.sin(phi) * Math.sin(theta);
        const sz = Math.cos(phi);
        const root3 = Math.sqrt(3);
        return [
          sx * sy,
          sx * sz,
          sy * sz,
          (sx * sx - sy * sy) / root3,
        ];
      }),
  },
  {
    id: 's3-slice',
    name: '3-Sphere Slice',
    symbol: 'S3',
    kind: 'slice',
    summary: 'The unit 3-sphere in R4, viewed by the ordinary 2-sphere produced at a fixed fourth coordinate.',
    details:
      'Move the w slice from -1 to 1 to see the cross-section grow from a point, become a large sphere, then collapse.',
    defaultScale: 1.55,
    makeGeometry: ({ uSegments, vSegments, sliceW }: TopologyParameters) =>
      makeParametricSurface(uSegments, vSegments, (u01, v01) => {
        const w = clamp(sliceW, -0.98, 0.98);
        const radius = Math.sqrt(Math.max(0, 1 - w * w));
        const theta = tau * u01;
        const phi = Math.PI * v01;
        return [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
          w,
        ];
      }),
  },
  {
    id: 'tesseract',
    name: 'Tesseract Boundary',
    symbol: 'I4',
    kind: 'wire',
    summary: 'The boundary graph of a 4D cube; the full boundary consists of eight ordinary cubes.',
    details:
      'The wireframe exposes the 16 vertices and 32 edges. Rotate through xw/yw/zw to see the fourth direction exchange with visible axes.',
    defaultScale: 1.15,
    makeGeometry: () => makeTesseractWire(),
  },
];

export function getTopologyObject(id: string): TopologyObject {
  return topologyObjects.find((object) => object.id === id) ?? topologyObjects[0];
}

function makeTesseractWire(): WireMesh4D {
  const positions: Array<readonly [number, number, number, number]> = [];
  const edges: Array<readonly [number, number]> = [];

  for (let i = 0; i < 16; i += 1) {
    positions.push([
      i & 1 ? 1 : -1,
      i & 2 ? 1 : -1,
      i & 4 ? 1 : -1,
      i & 8 ? 1 : -1,
    ]);
  }

  for (let i = 0; i < 16; i += 1) {
    for (let bit = 0; bit < 4; bit += 1) {
      const j = i ^ (1 << bit);
      if (i < j) {
        edges.push([i, j]);
      }
    }
  }

  return {
    kind: 'wire',
    positions,
    edges,
    wRange: [-1, 1],
  };
}
