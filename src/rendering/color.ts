import { Color } from 'three';
import { clamp, lerp } from '../math/vec4';

const low = new Color('#68d391');
const mid = new Color('#edf1f7');
const high = new Color('#63b3ed');

export function colorForW(w: number, range: readonly [number, number]): Color {
  const span = Math.max(0.0001, range[1] - range[0]);
  const t = clamp((w - range[0]) / span, 0, 1);

  if (t < 0.5) {
    return low.clone().lerp(mid, t * 2);
  }

  return mid.clone().lerp(high, (t - 0.5) * 2);
}

export function opacityForSlice(distance: number, width: number): number {
  if (width <= 0) return 1;
  return clamp(1 - distance / width, 0.08, 1);
}

export function mixNumberByW(
  w: number,
  range: readonly [number, number],
  lowValue: number,
  highValue: number,
): number {
  const span = Math.max(0.0001, range[1] - range[0]);
  return lerp(lowValue, highValue, clamp((w - range[0]) / span, 0, 1));
}
