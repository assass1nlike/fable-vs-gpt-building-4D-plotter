import type { RotationState } from './math/vec4';
import { Viewer, type ViewerState } from './rendering/viewer';
import { getTopologyObject, topologyObjects } from './topology/objects';
import type { TopologyObject, TopologyParameters } from './topology/types';

interface AppState extends ViewerState, TopologyParameters {
  objectId: string;
}

const initialRotations: RotationState = {
  xy: 0,
  xz: -0.18,
  xw: 0.55,
  yz: 0,
  yw: 0.3,
  zw: 0.18,
};

const state: AppState = {
  objectId: topologyObjects[0].id,
  uSegments: 80,
  vSegments: 40,
  sliceW: 0,
  rotations: initialRotations,
  projection: 'perspective',
  projectionDistance: 4,
  scale: topologyObjects[0].defaultScale,
  showWireframe: false,
  autoRotate: true,
};

export function mountApp(root: HTMLDivElement): void {
  root.innerHTML = `
    <main class="shell">
      <aside class="panel object-panel" aria-label="Object selection">
        <div class="brand">
          <span class="brand-mark"></span>
          <div>
            <h1>4D Plotter</h1>
            <p>R4 embeddings projected into R3</p>
          </div>
        </div>
        <div id="object-list" class="object-list"></div>
      </aside>
      <section class="viewport" aria-label="3D viewport">
        <canvas id="scene"></canvas>
        <div class="viewport-hud">
          <span id="hud-object"></span>
          <span id="hud-projection"></span>
        </div>
      </section>
      <aside id="controls" class="panel control-panel" aria-label="Controls"></aside>
    </main>
  `;

  const canvas = requireElement<HTMLCanvasElement>('#scene');
  const objectList = requireElement<HTMLDivElement>('#object-list');
  const controls = requireElement<HTMLDivElement>('#controls');
  const hudObject = requireElement<HTMLSpanElement>('#hud-object');
  const hudProjection = requireElement<HTMLSpanElement>('#hud-projection');
  const viewer = new Viewer(canvas, state);

  const setObject = (id: string): void => {
    state.objectId = id;
    state.scale = getTopologyObject(id).defaultScale;
    refresh();
  };

  const refresh = (): void => {
    const object = getTopologyObject(state.objectId);
    const geometry = object.makeGeometry(state);
    viewer.setGeometry(geometry);
    viewer.setState(state);
    renderObjectList(objectList, state.objectId, setObject);
    renderControls(controls, object, updateState);
    hudObject.textContent = object.name;
    hudProjection.textContent = `${state.projection} projection`;
  };

  const updateState = (patch: Partial<AppState>): void => {
    Object.assign(state, patch);
    refresh();
  };

  refresh();
}

function renderObjectList(
  container: HTMLDivElement,
  selectedId: string,
  onSelect: (id: string) => void,
): void {
  container.innerHTML = topologyObjects
    .map(
      (object) => `
        <button class="object-button ${object.id === selectedId ? 'is-active' : ''}" data-object-id="${object.id}">
          <span class="object-symbol">${object.symbol}</span>
          <span>
            <strong>${object.name}</strong>
            <small>${object.summary}</small>
          </span>
        </button>
      `,
    )
    .join('');

  for (const button of container.querySelectorAll<HTMLButtonElement>('[data-object-id]')) {
    button.addEventListener('click', () => onSelect(button.dataset.objectId ?? selectedId));
  }
}

function renderControls(
  container: HTMLDivElement,
  object: TopologyObject,
  onChange: (patch: Partial<AppState>) => void,
): void {
  container.innerHTML = `
    <section class="control-section">
      <h2>${object.name}</h2>
      <p>${object.details}</p>
    </section>

    <section class="control-section">
      <h3>Projection</h3>
      <label class="field">
        <span>Mode</span>
        <select id="projection">
          <option value="perspective" ${state.projection === 'perspective' ? 'selected' : ''}>Perspective</option>
          <option value="orthographic" ${state.projection === 'orthographic' ? 'selected' : ''}>Orthographic</option>
        </select>
      </label>
      ${rangeControl('projectionDistance', '4D camera distance', state.projectionDistance, 1.6, 8, 0.1)}
      ${rangeControl('scale', 'Scale', state.scale, 0.45, 2.4, 0.01)}
    </section>

    <section class="control-section">
      <h3>4D Rotation</h3>
      ${rotationControl('xy', 'XY')}
      ${rotationControl('xz', 'XZ')}
      ${rotationControl('xw', 'XW')}
      ${rotationControl('yz', 'YZ')}
      ${rotationControl('yw', 'YW')}
      ${rotationControl('zw', 'ZW')}
    </section>

    <section class="control-section">
      <h3>Sampling</h3>
      ${rangeControl('uSegments', 'U segments', state.uSegments, 24, 144, 1)}
      ${rangeControl('vSegments', 'V segments', state.vSegments, 12, 96, 1)}
      ${
        object.kind === 'slice'
          ? rangeControl('sliceW', 'Slice w', state.sliceW, -0.98, 0.98, 0.01)
          : `<div class="field-note">Color encodes the rotated fourth coordinate w.</div>`
      }
    </section>

    <section class="control-section toggle-grid">
      ${toggleControl('showWireframe', 'Wireframe', state.showWireframe)}
      ${toggleControl('autoRotate', 'Auto rotate in 4D', state.autoRotate)}
    </section>
  `;

  bindSelect(container, 'projection', (value) => onChange({ projection: value as AppState['projection'] }));
  bindRange(container, 'projectionDistance', (value) => onChange({ projectionDistance: value }));
  bindRange(container, 'scale', (value) => onChange({ scale: value }));
  bindRange(container, 'uSegments', (value) => onChange({ uSegments: Math.round(value) }));
  bindRange(container, 'vSegments', (value) => onChange({ vSegments: Math.round(value) }));
  bindRange(container, 'sliceW', (value) => onChange({ sliceW: value }));
  bindToggle(container, 'showWireframe', (value) => onChange({ showWireframe: value }));
  bindToggle(container, 'autoRotate', (value) => onChange({ autoRotate: value }));

  for (const plane of ['xy', 'xz', 'xw', 'yz', 'yw', 'zw'] as const) {
    bindRange(container, plane, (value) =>
      onChange({
        rotations: {
          ...state.rotations,
          [plane]: value,
        },
      }),
    );
  }
}

function rangeControl(
  id: string,
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
): string {
  return `
    <label class="field">
      <span>${label}<output>${formatNumber(value)}</output></span>
      <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
    </label>
  `;
}

function rotationControl(id: keyof RotationState, label: string): string {
  return rangeControl(id, label, state.rotations[id], -Math.PI, Math.PI, 0.01);
}

function toggleControl(id: string, label: string, checked: boolean): string {
  return `
    <label class="toggle">
      <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} />
      <span>${label}</span>
    </label>
  `;
}

function bindRange(container: HTMLElement, id: string, onInput: (value: number) => void): void {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  input?.addEventListener('input', () => onInput(Number(input.value)));
}

function bindSelect(container: HTMLElement, id: string, onInput: (value: string) => void): void {
  const input = container.querySelector<HTMLSelectElement>(`#${id}`);
  input?.addEventListener('change', () => onInput(input.value));
}

function bindToggle(container: HTMLElement, id: string, onInput: (value: boolean) => void): void {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  input?.addEventListener('change', () => onInput(input.checked));
}

function requireElement<TElement extends Element>(selector: string): TElement {
  const element = document.querySelector<TElement>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
