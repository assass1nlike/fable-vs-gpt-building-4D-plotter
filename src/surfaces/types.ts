import type { Vec4 } from '../math/vec4'
import type { ProjectionKind } from '../math/projection'

/**
 * 一个嵌入 R^4 的参数曲面。实现 evaluate 并在 registry.ts 注册即可
 * 出现在界面下拉框里。
 */
export interface Surface4D {
  id: string
  name: string
  /** 面板里显示的一段拓扑/几何说明。 */
  description: string
  uRange: [number, number]
  vRange: [number, number]
  uSegments: number
  vSegments: number
  /** 该曲面看起来效果最好的默认投影方式。 */
  defaultProjection: ProjectionKind
  /** 透视投影的默认 4D 相机距离（需大于曲面的 |w| 上界）。 */
  defaultDistance: number
  evaluate(u: number, v: number, out: Vec4): void
}
