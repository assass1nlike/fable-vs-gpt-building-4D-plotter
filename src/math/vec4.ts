/** R^4 中的旋转有 6 个独立的旋转平面（SO(4) 的维度是 6）。 */
export const PLANES = ['xy', 'xz', 'xw', 'yz', 'yw', 'zw'] as const
export type Plane = (typeof PLANES)[number]

export type Vec4 = [number, number, number, number]
/** 4×4 矩阵，行主序，长度 16。 */
export type Mat4 = number[]

const AXIS: Record<Plane, [number, number]> = {
  xy: [0, 1],
  xz: [0, 2],
  xw: [0, 3],
  yz: [1, 2],
  yw: [1, 3],
  zw: [2, 3],
}

export function identity(): Mat4 {
  // prettier-ignore
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]
}

/** 在指定坐标平面内旋转 angle 弧度，其余两个坐标轴不动。 */
export function planeRotation(plane: Plane, angle: number): Mat4 {
  const m = identity()
  const [a, b] = AXIS[plane]
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  m[a * 4 + a] = c
  m[a * 4 + b] = -s
  m[b * 4 + a] = s
  m[b * 4 + b] = c
  return m
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Array<number>(16)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let sum = 0
      for (let k = 0; k < 4; k++) sum += a[r * 4 + k] * b[k * 4 + c]
      out[r * 4 + c] = sum
    }
  }
  return out
}

/** 按 PLANES 的固定顺序把六个平面角合成一个旋转矩阵。 */
export function composeRotation(angles: Record<Plane, number>): Mat4 {
  let m = identity()
  for (const p of PLANES) {
    if (angles[p] !== 0) m = multiply(planeRotation(p, angles[p]), m)
  }
  return m
}

/** 把 src 中第 i 个四维点经 m 变换后写入 dst 的第 j 个槽位。 */
export function transformInto(
  m: Mat4,
  src: ArrayLike<number>,
  i: number,
  dst: Float32Array,
  j: number,
): void {
  const x = src[i * 4]
  const y = src[i * 4 + 1]
  const z = src[i * 4 + 2]
  const w = src[i * 4 + 3]
  dst[j * 4] = m[0] * x + m[1] * y + m[2] * z + m[3] * w
  dst[j * 4 + 1] = m[4] * x + m[5] * y + m[6] * z + m[7] * w
  dst[j * 4 + 2] = m[8] * x + m[9] * y + m[10] * z + m[11] * w
  dst[j * 4 + 3] = m[12] * x + m[13] * y + m[14] * z + m[15] * w
}
