import type { Surface4D } from './types'
import { kleinBottle } from './kleinBottle'
import { cliffordTorus } from './cliffordTorus'
import { projectivePlane } from './projectivePlane'
import { complexSquare } from './complexSquare'

export const surfaces: Surface4D[] = [
  kleinBottle,
  cliffordTorus,
  projectivePlane,
  complexSquare,
]

export function getSurface(id: string): Surface4D {
  const s = surfaces.find((s) => s.id === id)
  if (!s) throw new Error(`unknown surface: ${id}`)
  return s
}
