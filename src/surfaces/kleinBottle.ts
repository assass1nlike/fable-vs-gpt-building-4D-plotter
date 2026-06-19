import type { Surface4D } from './types'

const R = 1.4
const r = 0.6

/**
 * 克莱因瓶在 R^4 中的无自交嵌入。
 *
 * 前两个坐标是普通的环面圆 (R + r·cos v)·(cos u, sin u)，而管子截面的
 * sin v 分量放在 zw 平面里、以半角 u/2 旋转：u 走完一圈时截面翻转了
 * 半圈，把 v 粘合成 -v，得到不可定向的克莱因瓶。在 R^3 中必然出现的
 * 自交，在这里被第四维错开了。
 */
export const kleinBottle: Surface4D = {
  id: 'klein-bottle',
  name: '克莱因瓶 K²',
  description:
    '不可定向闭曲面，无法嵌入 R³，但能无自交地嵌入 R⁴。投影到 3D 时看到的' +
    '"自交环"其实在第四维上是分开的——转动 xw / yw 平面可以看到它错开。',
  uRange: [0, Math.PI * 2],
  vRange: [0, Math.PI * 2],
  uSegments: 128,
  vSegments: 64,
  defaultProjection: 'perspective',
  defaultDistance: 3,
  evaluate(u, v, out) {
    const ring = R + r * Math.cos(v)
    const tube = r * Math.sin(v)
    out[0] = ring * Math.cos(u)
    out[1] = ring * Math.sin(u)
    out[2] = tube * Math.cos(u / 2)
    out[3] = tube * Math.sin(u / 2)
  },
}
