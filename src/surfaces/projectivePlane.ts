import type { Surface4D } from './types'

const SCALE = 2.4

/**
 * 实射影平面 RP² 的 Veronese 型嵌入。
 *
 * 把单位球面上的点 (x,y,z) 映到 (xy, xz, yz, (x²-y²)/2)。四个分量都是
 * 二次齐次式，对径点 (x,y,z) 与 (-x,-y,-z) 映到同一点，因此球面参数化
 * 恰好双重覆盖了 RP²；该映射在 RP² 上是单射，给出无自交的嵌入。
 * （RP² 与克莱因瓶一样不可定向、不嵌入 R³。）
 */
export const projectivePlane: Surface4D = {
  id: 'projective-plane',
  name: '实射影平面 RP²',
  description:
    '球面把对径点粘合后的商空间，经 Veronese 映射 (xy, xz, yz, (x²−y²)/2) ' +
    '无自交地嵌入 R⁴。投影到 3D 时呈现 Roman / cross-cap 一族的形状。',
  uRange: [0, Math.PI * 2],
  vRange: [-Math.PI / 2, Math.PI / 2],
  uSegments: 96,
  vSegments: 64,
  defaultProjection: 'perspective',
  defaultDistance: 3,
  evaluate(u, v, out) {
    const x = Math.cos(v) * Math.cos(u)
    const y = Math.cos(v) * Math.sin(u)
    const z = Math.sin(v)
    out[0] = SCALE * x * y
    out[1] = SCALE * x * z
    out[2] = SCALE * y * z
    out[3] = SCALE * (x * x - y * y) * 0.5
  },
}
