declare module "three" {
  export const DoubleSide: number;

  export class Color {
    r: number;
    g: number;
    b: number;
    constructor(color?: string | number);
    set(color: string | number): this;
    setHex(hex: number): this;
    copy(c: Color): this;
    offsetHSL(h: number, s: number, l: number): this;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    lerp(v: Vector3, alpha: number): this;
    project(camera: PerspectiveCamera): this;
    clone(): Vector3;
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    constructor(params?: { antialias?: boolean; alpha?: boolean });
    setPixelRatio(ratio: number): void;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }

  export class Scene {
    background: Color | null;
    fog: FogExp2 | null;
    add(...objects: unknown[]): void;
    remove(...objects: unknown[]): void;
  }

  export class FogExp2 {
    color: Color;
    constructor(color: string | number, density?: number);
  }

  export class PerspectiveCamera {
    aspect: number;
    position: Vector3;
    constructor(fov: number, aspect: number, near: number, far: number);
    updateProjectionMatrix(): void;
    lookAt(x: number | Vector3, y?: number, z?: number): void;
  }

  export class AmbientLight {
    intensity: number;
    constructor(color?: string | number, intensity?: number);
  }

  export class HemisphereLight {
    intensity: number;
    constructor(skyColor: string | number, groundColor: string | number, intensity?: number);
  }

  export class DirectionalLight {
    intensity: number;
    color: Color;
    position: Vector3;
    constructor(color: string | number, intensity?: number);
  }

  export class PointLight {
    intensity: number;
    position: Vector3;
    constructor(color?: string | number, intensity?: number, distance?: number);
  }

  export class Group {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: Vector3;
    visible: boolean;
    add(...objects: unknown[]): void;
  }

  export class BufferAttribute {
    count: number;
    constructor(array: Float32Array, itemSize: number);
    getX(i: number): number;
    getZ(i: number): number;
    setY(i: number, y: number): void;
  }

  export class Float32BufferAttribute {
    constructor(array: number[], itemSize: number);
  }

  export class BufferGeometry {
    setAttribute(name: string, attr: Float32BufferAttribute | BufferAttribute): void;
    setFromPoints(points: Vector3[]): this;
    dispose(): void;
  }

  export class PlaneGeometry extends BufferGeometry {
    attributes: {
      position: BufferAttribute;
    };
    constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);
    rotateX(angle: number): void;
    computeVertexNormals(): void;
  }

  export class MeshStandardMaterial {
    opacity: number;
    emissiveIntensity: number;
    map: CanvasTexture | null;
    needsUpdate: boolean;
    constructor(params?: Record<string, unknown>);
    dispose(): void;
  }

  export class MeshBasicMaterial {
    opacity: number;
    map: CanvasTexture | null;
    needsUpdate: boolean;
    constructor(params?: Record<string, unknown>);
    dispose(): void;
  }

  export class PointsMaterial {
    constructor(params?: Record<string, unknown>);
    dispose(): void;
  }

  export class LineBasicMaterial {
    constructor(params?: Record<string, unknown>);
    dispose(): void;
  }

  export class CylinderGeometry extends BufferGeometry {
    constructor(rt: number, rb: number, h: number, segs?: number);
  }

  export class ConeGeometry extends BufferGeometry {
    constructor(r: number, h: number, segs?: number);
  }

  export class DodecahedronGeometry extends BufferGeometry {
    constructor(r: number, detail?: number);
  }

  export class OctahedronGeometry extends BufferGeometry {
    constructor(r: number, detail?: number);
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(r: number, ws?: number, hs?: number);
  }

  export class TorusGeometry extends BufferGeometry {
    constructor(r: number, tube: number, radialSegs?: number, tubularSegs?: number);
  }

  export class RingGeometry extends BufferGeometry {
    rotateX(angle: number): void;
    constructor(innerR: number, outerR: number, thetaSegs?: number);
  }

  export class CanvasTexture {
    needsUpdate: boolean;
    constructor(canvas: HTMLCanvasElement);
    dispose(): void;
  }

  export class Mesh {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: Vector3;
    visible: boolean;
    material: MeshStandardMaterial | MeshBasicMaterial;
    constructor(geometry: unknown, material: unknown);
    lookAt(x: number | Vector3, y?: number, z?: number): void;
  }

  export class Points {
    rotation: { x: number; y: number; z: number };
    constructor(geometry: unknown, material: unknown);
  }

  export class Line {
    geometry: BufferGeometry;
    material: LineBasicMaterial;
    constructor(geometry: BufferGeometry, material: LineBasicMaterial);
  }
}
