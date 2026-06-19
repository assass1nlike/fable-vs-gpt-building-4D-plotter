import * as THREE from 'three'
import type { Surface4D } from '../surfaces/types'
import type { Mat4 } from '../math/vec4'
import { transformInto } from '../math/vec4'
import type { ProjectionKind } from '../math/projection'
import { projectInto } from '../math/projection'

const tmpColor = new THREE.Color()

/**
 * 把一个 Surface4D 采样成 R^4 点阵，每帧做 旋转 → 投影 → 着色。
 * 颜色按旋转后的 w 坐标取色相，让"第四维的深度"直接可见。
 */
export class SurfaceMesh {
  readonly mesh: THREE.Mesh
  private readonly geometry: THREE.BufferGeometry
  private readonly material: THREE.MeshStandardMaterial
  /** 原始 R^4 采样点，构建后不变。 */
  private readonly source: Float32Array
  /** 旋转后的 R^4 点，每帧重写。 */
  private readonly rotated: Float32Array
  private readonly count: number

  constructor(surface: Surface4D) {
    const { uSegments: us, vSegments: vs } = surface
    const [u0, u1] = surface.uRange
    const [v0, v1] = surface.vRange
    this.count = (us + 1) * (vs + 1)
    this.source = new Float32Array(this.count * 4)
    this.rotated = new Float32Array(this.count * 4)

    const out: [number, number, number, number] = [0, 0, 0, 0]
    let i = 0
    for (let iv = 0; iv <= vs; iv++) {
      const v = v0 + ((v1 - v0) * iv) / vs
      for (let iu = 0; iu <= us; iu++) {
        const u = u0 + ((u1 - u0) * iu) / us
        surface.evaluate(u, v, out)
        this.source.set(out, i * 4)
        i++
      }
    }

    const indices: number[] = []
    for (let iv = 0; iv < vs; iv++) {
      for (let iu = 0; iu < us; iu++) {
        const a = iv * (us + 1) + iu
        const b = a + 1
        const c = a + (us + 1)
        const d = c + 1
        indices.push(a, c, b, b, c, d)
      }
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setIndex(indices)
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(this.count * 3), 3),
    )
    this.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(this.count * 3), 3),
    )
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.45,
      metalness: 0.05,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }

  setWireframe(on: boolean): void {
    this.material.wireframe = on
  }

  update(rotation: Mat4, projection: ProjectionKind, distance: number): void {
    let minW = Infinity
    let maxW = -Infinity
    for (let i = 0; i < this.count; i++) {
      transformInto(rotation, this.source, i, this.rotated, i)
      const w = this.rotated[i * 4 + 3]
      if (w < minW) minW = w
      if (w > maxW) maxW = w
    }
    const span = Math.max(maxW - minW, 1e-6)

    const pos = this.geometry.getAttribute('position') as THREE.BufferAttribute
    const col = this.geometry.getAttribute('color') as THREE.BufferAttribute
    const posArr = pos.array as Float32Array
    const colArr = col.array as Float32Array
    for (let i = 0; i < this.count; i++) {
      const x = this.rotated[i * 4]
      const y = this.rotated[i * 4 + 1]
      const z = this.rotated[i * 4 + 2]
      const w = this.rotated[i * 4 + 3]
      projectInto(projection, distance, x, y, z, w, posArr, i)
      // 色相从青(w 最小)扫到品红(w 最大)
      tmpColor.setHSL(0.5 + (0.35 * (w - minW)) / span, 0.75, 0.55)
      colArr[i * 3] = tmpColor.r
      colArr[i * 3 + 1] = tmpColor.g
      colArr[i * 3 + 2] = tmpColor.b
    }
    pos.needsUpdate = true
    col.needsUpdate = true
    this.geometry.computeVertexNormals()
    this.geometry.computeBoundingSphere()
  }

  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
  }
}
