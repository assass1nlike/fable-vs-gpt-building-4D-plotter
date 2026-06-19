import type { Surface4D } from './types'

const RADIUS = 1.4
const K = RADIUS / Math.SQRT2

/**
 * Clifford 平环面：S³ 中两个等半径圆的笛卡尔积，内蕴曲率处处为零。
 *
 * 默认用球极投影：投影像是 Dupin cyclide（标准圆环面），转动 xw / yw /
 * zw 平面时环面会经过投影北极"翻穿过无穷远"，内外两侧互换——这是
 * 4D 绘图最经典的演示。
 */
export const cliffordTorus: Surface4D = {
  id: 'clifford-torus',
  name: 'Clifford 平环面 T²',
  description:
    '住在三维球面 S³ 上的平坦环面 (cos u, sin u, cos v, sin v)/√2。' +
    '球极投影下是标准圆环面；做 4D 旋转时它会翻穿无穷远、内外互换。',
  uRange: [0, Math.PI * 2],
  vRange: [0, Math.PI * 2],
  uSegments: 96,
  vSegments: 96,
  defaultProjection: 'stereographic',
  defaultDistance: 3,
  evaluate(u, v, out) {
    out[0] = K * Math.cos(u)
    out[1] = K * Math.sin(u)
    out[2] = K * Math.cos(v)
    out[3] = K * Math.sin(v)
  },
}
