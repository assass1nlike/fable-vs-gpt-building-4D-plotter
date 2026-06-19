export type ProjectionKind = 'orthographic' | 'perspective' | 'stereographic'

export const PROJECTIONS: { id: ProjectionKind; label: string }[] = [
  { id: 'perspective', label: '透视投影（4D 相机在 w 轴上）' },
  { id: 'stereographic', label: '球极投影（从每点所在球面的北极）' },
  { id: 'orthographic', label: '正交投影（直接丢掉 w）' },
]

/** 投影点贴得太近时分母会爆炸，截断以避免 NaN / 顶点飞出。 */
const MIN_DENOM = 0.06

/**
 * 把四维点 (x,y,z,w) 投影到 R^3，写入 pos 的第 j 个槽位。
 *
 * - perspective：4D 相机位于 (0,0,0,distance)，缩放因子 d/(d-w)。
 * - stereographic：从半径 r=|v| 的三维球面北极 (0,0,0,r) 投影；对落在
 *   S^3 上的曲面（如 Clifford 环面）这是经典球极投影，对一般曲面则是
 *   按各点半径的径向球极投影。
 * - orthographic：直接取 (x,y,z)。
 */
export function projectInto(
  kind: ProjectionKind,
  distance: number,
  x: number,
  y: number,
  z: number,
  w: number,
  pos: Float32Array,
  j: number,
): void {
  let s = 1
  if (kind === 'perspective') {
    let denom = distance - w
    if (Math.abs(denom) < MIN_DENOM) denom = denom < 0 ? -MIN_DENOM : MIN_DENOM
    s = distance / denom
  } else if (kind === 'stereographic') {
    const r = Math.sqrt(x * x + y * y + z * z + w * w)
    let denom = r - w
    if (denom < MIN_DENOM) denom = MIN_DENOM
    s = r / denom
  }
  pos[j * 3] = x * s
  pos[j * 3 + 1] = y * s
  pos[j * 3 + 2] = z * s
}
