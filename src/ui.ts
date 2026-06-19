import { PLANES, type Plane } from './math/vec4'
import { PROJECTIONS, type ProjectionKind } from './math/projection'
import type { Surface4D } from './surfaces/types'

export interface PlotterState {
  surfaceId: string
  projection: ProjectionKind
  /** 透视投影的 4D 相机距离。 */
  distance: number
  angles: Record<Plane, number>
  /** 勾选的平面以 spinSpeed 持续自转。 */
  spins: Record<Plane, boolean>
  spinSpeed: number
  wireframe: boolean
}

export interface UIHandles {
  /** 自转推进角度后，把滑块位置同步回界面。 */
  syncAngles(): void
}

const TWO_PI = Math.PI * 2

export function buildUI(
  panel: HTMLElement,
  surfaces: Surface4D[],
  state: PlotterState,
  onSurfaceChange: (id: string) => void,
  onWireframeChange: (on: boolean) => void,
): UIHandles {
  panel.innerHTML = ''

  // ---- 曲面选择 ----
  const surfaceSelect = document.createElement('select')
  for (const s of surfaces) {
    const opt = document.createElement('option')
    opt.value = s.id
    opt.textContent = s.name
    surfaceSelect.appendChild(opt)
  }
  surfaceSelect.value = state.surfaceId
  panel.appendChild(labeled('拓扑空间', surfaceSelect))

  const desc = document.createElement('p')
  desc.className = 'desc'
  panel.appendChild(desc)

  // ---- 投影方式 ----
  const projSelect = document.createElement('select')
  for (const p of PROJECTIONS) {
    const opt = document.createElement('option')
    opt.value = p.id
    opt.textContent = p.label
    projSelect.appendChild(opt)
  }
  projSelect.value = state.projection
  projSelect.addEventListener('change', () => {
    state.projection = projSelect.value as ProjectionKind
    syncDistanceEnabled()
  })
  panel.appendChild(labeled('投影 R⁴ → R³', projSelect))

  const distSlider = slider(1.2, 8, 0.1, state.distance)
  const distValue = document.createElement('span')
  distSlider.addEventListener('input', () => {
    state.distance = Number(distSlider.value)
    distValue.textContent = state.distance.toFixed(1)
  })
  panel.appendChild(labeled('4D 相机距离', wrap(distSlider, distValue)))

  function syncDistanceEnabled(): void {
    distSlider.disabled = state.projection !== 'perspective'
  }

  // ---- 六个旋转平面 ----
  const section = document.createElement('div')
  section.className = 'section-title'
  section.textContent = '4D 旋转（六个平面）'
  panel.appendChild(section)

  const angleSliders = {} as Record<Plane, HTMLInputElement>
  for (const plane of PLANES) {
    const s = slider(0, TWO_PI, 0.01, state.angles[plane])
    s.addEventListener('input', () => {
      state.angles[plane] = Number(s.value)
    })
    angleSliders[plane] = s

    const spin = document.createElement('input')
    spin.type = 'checkbox'
    spin.checked = state.spins[plane]
    spin.title = '自转'
    spin.addEventListener('change', () => {
      state.spins[plane] = spin.checked
    })

    const row = document.createElement('div')
    row.className = 'plane-row'
    const tag = document.createElement('span')
    tag.className = 'plane-tag'
    tag.textContent = plane
    row.append(tag, s, spin)
    panel.appendChild(row)
  }

  const speedSlider = slider(0.05, 1.5, 0.05, state.spinSpeed)
  speedSlider.addEventListener('input', () => {
    state.spinSpeed = Number(speedSlider.value)
  })
  panel.appendChild(labeled('自转速度 (rad/s)', speedSlider))

  // ---- 杂项 ----
  const wire = document.createElement('input')
  wire.type = 'checkbox'
  wire.checked = state.wireframe
  wire.addEventListener('change', () => {
    state.wireframe = wire.checked
    onWireframeChange(wire.checked)
  })
  panel.appendChild(labeled('线框模式', wire))

  const reset = document.createElement('button')
  reset.textContent = '复位旋转'
  reset.addEventListener('click', () => {
    for (const p of PLANES) {
      state.angles[p] = 0
      state.spins[p] = false
    }
    syncAll()
  })
  panel.appendChild(reset)

  // ---- 同步逻辑 ----
  function syncAll(): void {
    surfaceSelect.value = state.surfaceId
    projSelect.value = state.projection
    distSlider.value = String(state.distance)
    distValue.textContent = state.distance.toFixed(1)
    for (const p of PLANES) angleSliders[p].value = String(state.angles[p])
    panel
      .querySelectorAll<HTMLInputElement>('.plane-row input[type=checkbox]')
      .forEach((el, i) => (el.checked = state.spins[PLANES[i]]))
    const surf = surfaces.find((s) => s.id === state.surfaceId)
    desc.textContent = surf ? surf.description : ''
    syncDistanceEnabled()
  }

  surfaceSelect.addEventListener('change', () => {
    onSurfaceChange(surfaceSelect.value)
    syncAll()
  })

  syncAll()

  return {
    syncAngles() {
      for (const p of PLANES) angleSliders[p].value = String(state.angles[p])
    },
  }
}

function labeled(text: string, control: HTMLElement): HTMLElement {
  const row = document.createElement('label')
  row.className = 'control-row'
  const span = document.createElement('span')
  span.textContent = text
  row.append(span, control)
  return row
}

function wrap(...els: HTMLElement[]): HTMLElement {
  const div = document.createElement('div')
  div.className = 'inline'
  div.append(...els)
  return div
}

function slider(min: number, max: number, step: number, value: number): HTMLInputElement {
  const s = document.createElement('input')
  s.type = 'range'
  s.min = String(min)
  s.max = String(max)
  s.step = String(step)
  s.value = String(value)
  return s
}
