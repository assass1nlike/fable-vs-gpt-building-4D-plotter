import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  GridHelper,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { projectOrthographic4, projectPerspective4, rotate4, type RotationState } from '../math/vec4';
import type { Geometry4D, SurfaceMesh4D, WireMesh4D } from '../topology/types';
import { colorForW, mixNumberByW } from './color';

export interface ViewerState {
  rotations: RotationState;
  projection: 'perspective' | 'orthographic';
  projectionDistance: number;
  scale: number;
  showWireframe: boolean;
  autoRotate: boolean;
}

export class Viewer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(45, 1, 0.1, 100);
  private readonly controls: OrbitControls;
  private readonly surfaceMaterial = new MeshStandardMaterial({
    side: DoubleSide,
    vertexColors: true,
    roughness: 0.68,
    metalness: 0.04,
    transparent: true,
    opacity: 0.92,
  });
  private readonly wireMaterial = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });
  private geometry: Geometry4D | null = null;
  private renderable: Mesh | LineSegments | null = null;
  private animationFrame = 0;
  private state: ViewerState;
  private lastTime = 0;

  constructor(private readonly canvas: HTMLCanvasElement, initialState: ViewerState) {
    this.state = initialState;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(new Color('#090b0e'), 1);

    this.camera.position.set(0, 1.35, 5.7);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2.4;
    this.controls.maxDistance = 12;

    const ambient = new AmbientLight('#d8e3f0', 1.7);
    const key = new DirectionalLight('#ffffff', 2.1);
    key.position.set(3, 5, 4);
    const fill = new DirectionalLight('#68d391', 0.8);
    fill.position.set(-4, -2, 3);
    this.scene.add(ambient, key, fill);

    const grid = new GridHelper(5, 10, '#22303b', '#182028');
    grid.position.y = -1.85;
    this.scene.add(grid);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.animate(0);
  }

  setGeometry(geometry: Geometry4D): void {
    this.geometry = geometry;
    this.rebuild();
  }

  setState(next: Partial<ViewerState>): void {
    this.state = { ...this.state, ...next };
    this.rebuild();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.resize);
    this.controls.dispose();
    this.renderer.dispose();
  }

  private readonly resize = (): void => {
    const { clientWidth, clientHeight } = this.canvas;
    const width = Math.max(1, clientWidth);
    const height = Math.max(1, clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.render(this.scene, this.camera);
  };

  private readonly animate = (time: number): void => {
    const delta = Math.min(0.04, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;

    if (this.state.autoRotate) {
      this.state.rotations = {
        ...this.state.rotations,
        xw: this.state.rotations.xw + delta * 0.38,
        zw: this.state.rotations.zw + delta * 0.24,
      };
      this.rebuild();
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private rebuild(): void {
    if (!this.geometry) return;

    if (this.renderable) {
      this.scene.remove(this.renderable);
      this.renderable.geometry.dispose();
    }

    this.renderable =
      this.geometry.kind === 'surface'
        ? this.buildSurface(this.geometry)
        : this.buildWire(this.geometry);
    this.scene.add(this.renderable);
  }

  private buildSurface(mesh: SurfaceMesh4D): Mesh {
    const geometry = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const projected = mesh.positions.map((point) => this.project(point));

    for (const point of projected) {
      positions.push(point.x, point.y, point.z);
      const color = colorForW(point.w, mesh.wRange);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setIndex(mesh.indices);
    geometry.computeVertexNormals();

    this.surfaceMaterial.wireframe = this.state.showWireframe;
    const object = new Mesh(geometry, this.surfaceMaterial);
    object.scale.setScalar(this.state.scale);
    return object;
  }

  private buildWire(wire: WireMesh4D): LineSegments {
    const geometry = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    for (const edge of wire.edges) {
      for (const index of edge) {
        const point = this.project(wire.positions[index]);
        positions.push(point.x, point.y, point.z);
        const brightness = mixNumberByW(point.w, wire.wRange, 0.65, 1);
        const color = colorForW(point.w, wire.wRange).multiplyScalar(brightness);
        colors.push(color.r, color.g, color.b);
      }
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));

    const object = new LineSegments(geometry, this.wireMaterial);
    object.scale.setScalar(this.state.scale);
    return object;
  }

  private project(point: readonly [number, number, number, number]) {
    const rotated = rotate4(point, this.state.rotations);
    const projected =
      this.state.projection === 'perspective'
        ? projectPerspective4(rotated, this.state.projectionDistance)
        : projectOrthographic4(rotated);

    return {
      x: projected.x,
      y: projected.z,
      z: -projected.y,
      w: projected.w,
    };
  }
}
