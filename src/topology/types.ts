import type { Vec4 } from '../math/vec4';

export type ObjectKind = 'surface' | 'slice' | 'wire';

export interface SurfaceMesh4D {
  kind: 'surface';
  positions: Vec4[];
  indices: number[];
  uSegments: number;
  vSegments: number;
  wRange: readonly [number, number];
}

export interface WireMesh4D {
  kind: 'wire';
  positions: Vec4[];
  edges: Array<readonly [number, number]>;
  wRange: readonly [number, number];
}

export type Geometry4D = SurfaceMesh4D | WireMesh4D;

export interface TopologyParameters {
  uSegments: number;
  vSegments: number;
  sliceW: number;
}

export interface TopologyObject {
  id: string;
  name: string;
  symbol: string;
  kind: ObjectKind;
  summary: string;
  details: string;
  defaultScale: number;
  makeGeometry(parameters: TopologyParameters): Geometry4D;
}
