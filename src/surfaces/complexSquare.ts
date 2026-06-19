import type { Surface4D } from './types'

const LIM = 1.3
const W_SCALE = 0.55

/**
 * 复函数 w = z² 的图像：{ (z, z²) : z ∈ C } ⊂ C² ≅ R⁴。
 *
 * 任何复解析函数的图像都是 R⁴ 中光滑无自交的实二维曲面。z² 的反函数
 * √z 是双值的，但那只是把同一张曲面换个方向投影——在 R⁴ 里黎曼面
 * 本来就没有分支切割。
 */
export const complexSquare: Surface4D = {
  id: 'complex-square',
  name: '复抛物面 w = z²（黎曼面）',
  description:
    'C² ≅ R⁴ 中复函数 z ↦ z² 的图像 (Re z, Im z, Re z², Im z²)。' +
    '旋转 zw 平面相当于在"看 z²"与"看 √z"之间连续过渡，双值分支在 4D 中是光滑一片。',
  uRange: [-LIM, LIM],
  vRange: [-LIM, LIM],
  uSegments: 80,
  vSegments: 80,
  defaultProjection: 'perspective',
  defaultDistance: 3.5,
  evaluate(u, v, out) {
    out[0] = u
    out[1] = v
    out[2] = (u * u - v * v) * W_SCALE
    out[3] = 2 * u * v * W_SCALE
  },
}
