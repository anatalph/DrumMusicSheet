import * as THREE from 'three';
import type {ElementRenderer} from './SceneReconciler';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HIGHWAY_HALF_WIDTH = 0.45;

// ---------------------------------------------------------------------------
// MarkerElementData
// ---------------------------------------------------------------------------

export interface MarkerElementData {
  text: string;
  /** Vertical stack index for markers at the same tick. 0 = no offset. */
  stackIndex?: number;
}

// ---------------------------------------------------------------------------
// Texture cache (shared module-scope; lazy entries per state-quad)
// ---------------------------------------------------------------------------

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Create a text label texture for a marker flag.
 * White text on a semi-transparent colored background.
 *
 * Uses the same 2x-resolution canvas approach as the existing
 * createSectionTexture in SceneOverlays for crisp text rendering.
 */
function createMarkerTexture(
  text: string,
  color: [number, number, number],
  isSelected: boolean,
  isHovered: boolean,
): THREE.CanvasTexture {
  const key = `${text}:${color.join(',')}:${isSelected}:${isHovered}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Render at 4x resolution for crisp text at larger display size
  const scale = 4;
  const fontSize = 24 * scale;
  const padding = 16 * scale;

  ctx.font = `bold ${fontSize}px sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  canvas.width = textWidth + padding * 2;
  canvas.height = 36 * scale;

  // Background -- marker color with transparency. Hover bumps mid-way
  // between the resting (0.35) and selected (0.6) alphas so the hover
  // feedback is visible without making it look "selected".
  const [r, g, b] = color;
  const bgAlpha = isSelected ? 0.6 : isHovered ? 0.5 : 0.35;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bgAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Selected border
  if (isSelected) {
    ctx.strokeStyle = `rgba(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)}, 0.9)`;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  }

  // Text -- white
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padding, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(key, texture);
  return texture;
}

// ---------------------------------------------------------------------------
// userData layout for marker groups
// ---------------------------------------------------------------------------

interface MarkerUserData {
  /**
   * Lazily-resolved texture variants. The rest variant is always baked at
   * create time; the others are getters that bake on first hover/select
   * transition. After a getter resolves, the entry is replaced with the
   * cached texture so subsequent toggles are O(1).
   */
  textures: {
    rest: THREE.CanvasTexture;
    hover: THREE.CanvasTexture | (() => THREE.CanvasTexture);
    selected: THREE.CanvasTexture | (() => THREE.CanvasTexture);
    selectedHover: THREE.CanvasTexture | (() => THREE.CanvasTexture);
  };
  state: {hovered: boolean; selected: boolean};
}

function getMarkerUserData(group: THREE.Group): MarkerUserData | null {
  const u = group.userData as Partial<MarkerUserData>;
  if (!u.textures || !u.state) return null;
  return u as MarkerUserData;
}

function applyCurrentTexture(group: THREE.Group): void {
  const u = getMarkerUserData(group);
  if (!u) return;
  const sprite = MarkerRenderer.getFlagSprite(group);
  if (!sprite) return;
  const {hovered, selected} = u.state;
  let next: THREE.CanvasTexture;
  if (selected && hovered) {
    if (typeof u.textures.selectedHover === 'function') {
      u.textures.selectedHover = u.textures.selectedHover();
    }
    next = u.textures.selectedHover;
  } else if (selected) {
    if (typeof u.textures.selected === 'function') {
      u.textures.selected = u.textures.selected();
    }
    next = u.textures.selected;
  } else if (hovered) {
    if (typeof u.textures.hover === 'function') {
      u.textures.hover = u.textures.hover();
    }
    next = u.textures.hover;
  } else {
    next = u.textures.rest;
  }
  const material = sprite.material as THREE.SpriteMaterial;
  if (material.map !== next) {
    material.map = next;
    material.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// MarkerRenderer
// ---------------------------------------------------------------------------

/**
 * Configurable ElementRenderer for all marker types (sections, lyrics,
 * BPM changes, time signatures, vocal phrases).
 *
 * Each instance is parameterised by side (left/right) and color (RGB).
 * The reconciler registers one instance per marker kind.
 */
export class MarkerRenderer implements ElementRenderer<MarkerElementData> {
  private clippingPlanes: THREE.Plane[];
  private side: 'left' | 'right';
  private color: [number, number, number];

  constructor(
    clippingPlanes: THREE.Plane[],
    side: 'left' | 'right',
    color: [number, number, number],
  ) {
    this.clippingPlanes = clippingPlanes;
    this.side = side;
    this.color = color;
  }

  create(data: MarkerElementData): THREE.Group {
    const group = new THREE.Group();

    // 1. Text flag sprite -- baked at the rest state. Hover/selected variants
    //    bake lazily on first transition (see setHovered/setSelected).
    const restTexture = createMarkerTexture(
      data.text,
      this.color,
      false,
      false,
    );
    const text = data.text;
    const color = this.color;
    const userData: MarkerUserData = {
      textures: {
        rest: restTexture,
        hover: () => createMarkerTexture(text, color, false, true),
        selected: () => createMarkerTexture(text, color, true, false),
        selectedHover: () => createMarkerTexture(text, color, true, true),
      },
      state: {hovered: false, selected: false},
    };
    group.userData = userData;

    const material = new THREE.SpriteMaterial({
      map: restTexture,
      transparent: true,
      depthTest: false,
    });
    material.clippingPlanes = this.clippingPlanes;

    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 8;

    // Scale proportional to texture aspect ratio
    const texCanvas = restTexture.image as HTMLCanvasElement;
    const aspect = texCanvas.width / texCanvas.height;
    const flagHeight = 0.11;
    sprite.scale.set(flagHeight * aspect, flagHeight, 1);

    // Stack offset: shift each marker up by its stack index to avoid overlap
    const stackOffset = (data.stackIndex ?? 0) * flagHeight * 1.1;

    if (this.side === 'right') {
      // Right side: anchor at left edge so it extends rightward
      sprite.center.set(0.0, 0.5);
      sprite.position.set(HIGHWAY_HALF_WIDTH + 0.02, stackOffset, 0.001);
    } else {
      // Left side: anchor at right edge so it extends leftward
      sprite.center.set(1.0, 0.5);
      sprite.position.set(-HIGHWAY_HALF_WIDTH - 0.02, stackOffset, 0.001);
    }

    group.add(sprite);

    // 2. Thin colored horizontal line across the highway
    const [r, g, b] = this.color;
    const lineColor = new THREE.Color(r / 255, g / 255, b / 255);
    const lineGeom = new THREE.PlaneGeometry(HIGHWAY_HALF_WIDTH * 2, 0.003);
    const lineMat = new THREE.MeshBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.4,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    lineMat.clippingPlanes = this.clippingPlanes;
    const lineMesh = new THREE.Mesh(lineGeom, lineMat);
    lineMesh.renderOrder = 2;
    lineMesh.position.set(0, 0, 0.001);

    group.add(lineMesh);

    return group;
  }

  recycle(group: THREE.Group): void {
    // Dispose all children's materials and geometries. The userData getters
    // and any baked texture references go to GC with the group; cached
    // textures live on the shared module-scoped textureCache.
    for (const child of group.children) {
      if (child instanceof THREE.Sprite) {
        (child.material as THREE.SpriteMaterial).dispose();
      } else if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.MeshBasicMaterial).dispose();
      }
    }
  }

  setHovered(group: THREE.Group, hovered: boolean): void {
    const u = getMarkerUserData(group);
    if (!u) return;
    if (u.state.hovered === hovered) return;
    u.state.hovered = hovered;
    applyCurrentTexture(group);
  }

  setSelected(group: THREE.Group, selected: boolean): void {
    const u = getMarkerUserData(group);
    if (!u) return;
    if (u.state.selected === selected) return;
    u.state.selected = selected;
    applyCurrentTexture(group);
  }

  /**
   * Find the text-flag sprite inside a marker group, for raycasting and
   * hit-testing. Returns null if the group's children have changed in a
   * way we don't recognize.
   */
  static getFlagSprite(group: THREE.Group): THREE.Sprite | null {
    for (const child of group.children) {
      if (child instanceof THREE.Sprite) return child;
    }
    return null;
  }

  /** Clear the shared texture cache. Call on dispose. */
  static clearTextureCache(): void {
    for (const texture of textureCache.values()) {
      texture.dispose();
    }
    textureCache.clear();
  }
}
