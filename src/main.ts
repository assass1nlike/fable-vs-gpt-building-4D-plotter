import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { PLANES, composeRotation, type Plane } from './math/vec4'
import { surfaces, getSurface } from './surfaces/registry'
import { SurfaceMesh } from './render/mesh'
import { buildUI, type PlotterState } from './ui'

const TWO_PI = Math.PI * 2

const container = document.getElementById('app')!
const panel = document.getElementById('panel')!

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0b0e14)

const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
camera.position.set(0, 2.2, 5)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x252033, 1.1))
const key = new THREE.DirectionalLight(0xffffff, 1.6)
key.position.set(3, 5, 4)
scene.add(key)
const fill = new THREE.DirectionalLight(0x8899ff, 0.5)
fill.position.set(-4, -2, -3)
scene.add(fill)

function zeroAngles(): Record<Plane, number> {
  return Object.fromEntries(PLANES.map((p) => [p, 0])) as Record<Plane, number>
}

const initial = surfaces[0]
const state: PlotterState = {
  surfaceId: initial.id,
  projection: initial.defaultProjection,
  distance: initial.defaultDistance,
  angles: zeroAngles(),
  spins: Object.fromEntries(PLANES.map((p) => [p, p === 'xw'])) as Record<Plane, boolean>,
  spinSpeed: 0.4,
  wireframe: false,
}

let surfaceMesh = new SurfaceMesh(initial)
scene.add(surfaceMesh.mesh)

function switchSurface(id: string): void {
  const surf = getSurface(id)
  scene.remove(surfaceMesh.mesh)
  surfaceMesh.dispose()
  surfaceMesh = new SurfaceMesh(surf)
  surfaceMesh.setWireframe(state.wireframe)
  scene.add(surfaceMesh.mesh)
  state.surfaceId = id
  state.projection = surf.defaultProjection
  state.distance = surf.defaultDistance
}

const ui = buildUI(panel, surfaces, state, switchSurface, (on) =>
  surfaceMesh.setWireframe(on),
)

function resize(): void {
  const w = container.clientWidth
  const h = container.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}
window.addEventListener('resize', resize)
resize()

const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1)
  let spinning = false
  for (const p of PLANES) {
    if (state.spins[p]) {
      state.angles[p] = (state.angles[p] + state.spinSpeed * dt) % TWO_PI
      spinning = true
    }
  }
  if (spinning) ui.syncAngles()

  surfaceMesh.update(composeRotation(state.angles), state.projection, state.distance)
  controls.update()
  renderer.render(scene, camera)
})
