import type { Vec4 } from '../math/vec4';
import type { SurfaceMesh4D } from './types';

export function makeParametricSurface(
  uSegments: number,
  vSegments: number,
  sampler: (u: number, v: number) => Vec4,
): SurfaceMesh4D {
  const positions: Vec4[] = [];
  const indices: number[] = [];
  let minW = Number.POSITIVE_INFINITY;
  let maxW = Number.NEGATIVE_INFINITY;

  for (let j = 0; j <= vSegments; j += 1) {
    const v = j / vSegments;
    for (let i = 0; i <= uSegments; i += 1) {
      const u = i / uSegments;
      const point = sampler(u, v);
      minW = Math.min(minW, point[3]);
      maxW = Math.max(maxW, point[3]);
      positions.push(point);
    }
  }

  const row = uSegments + 1;
  for (let j = 0; j < vSegments; j += 1) {
    for (let i = 0; i < uSegments; i += 1) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return {
    kind: 'surface',
    positions,
    indices,
    uSegments,
    vSegments,
    wRange: [minW, maxW],
  };
}
