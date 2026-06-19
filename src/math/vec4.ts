export type Vec4 = readonly [number, number, number, number];

export type Plane4D = 'xy' | 'xz' | 'xw' | 'yz' | 'yw' | 'zw';

export interface RotationState {
  xy: number;
  xz: number;
  xw: number;
  yz: number;
  yw: number;
  zw: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  w: number;
}

export function rotate4(point: Vec4, rotations: RotationState): Vec4 {
  let next = point;
  next = rotatePlane(next, 'xy', rotations.xy);
  next = rotatePlane(next, 'xz', rotations.xz);
  next = rotatePlane(next, 'xw', rotations.xw);
  next = rotatePlane(next, 'yz', rotations.yz);
  next = rotatePlane(next, 'yw', rotations.yw);
  next = rotatePlane(next, 'zw', rotations.zw);
  return next;
}

export function rotatePlane(point: Vec4, plane: Plane4D, angle: number): Vec4 {
  if (angle === 0) return point;

  const indices = planeToIndices(plane);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const result = [...point] as [number, number, number, number];
  const a = point[indices[0]];
  const b = point[indices[1]];
  result[indices[0]] = a * c - b * s;
  result[indices[1]] = a * s + b * c;
  return result;
}

export function projectPerspective4(point: Vec4, distance: number): ProjectedPoint {
  const safeDistance = Math.max(0.35, distance);
  const denominator = Math.max(0.12, safeDistance - point[3]);
  const scale = safeDistance / denominator;

  return {
    x: point[0] * scale,
    y: point[1] * scale,
    z: point[2] * scale,
    w: point[3],
  };
}

export function projectOrthographic4(point: Vec4): ProjectedPoint {
  return {
    x: point[0],
    y: point[1],
    z: point[2],
    w: point[3],
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function planeToIndices(plane: Plane4D): readonly [number, number] {
  switch (plane) {
    case 'xy':
      return [0, 1];
    case 'xz':
      return [0, 2];
    case 'xw':
      return [0, 3];
    case 'yz':
      return [1, 2];
    case 'yw':
      return [1, 3];
    case 'zw':
      return [2, 3];
  }
}
