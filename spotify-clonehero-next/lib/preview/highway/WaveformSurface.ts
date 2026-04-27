import * as THREE from 'three';

// ---------------------------------------------------------------------------
// WaveformSurface -- renders a high-detail oscilloscope-style waveform
// ---------------------------------------------------------------------------

/**
 * Canvas height for the visible window. Higher = more detail.
 * This canvas is re-drawn every frame for just the visible ~1.3s window,
 * so it can be high-resolution without memory issues.
 */
const CANVAS_HEIGHT = 2048;
/** Canvas width — higher = crisper horizontal peaks. */
const CANVAS_WIDTH = 512;

/** Waveform line colour (light grey, like Moonscraper). */
const WAVE_COLOR = 'rgba(200, 200, 200, 0.7)';

/**
 * Fraction of the canvas half-width the loudest sample should reach (per side).
 * 0.8 means the global peak renders at 80% of the highway width per side, so
 * the symmetric waveform fills 80% of the highway width at its loudest point.
 */
const PEAK_FILL_RATIO = 0.8;

/**
 * Compute the global peak amplitude (absolute value) across all samples and
 * channels in a PCM buffer. Returns 0 if the buffer is silent or empty.
 *
 * Pulled out as a pure helper so the normalization math is unit-testable.
 */
export function computeGlobalPeak(audioData: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < audioData.length; i++) {
    const v = audioData[i];
    const abs = v < 0 ? -v : v;
    if (abs > peak) peak = abs;
  }
  return peak;
}

/**
 * Compute the half-width (in pixels, from the canvas centre line) for a row
 * given the row's local peak amplitude, the global peak, and the canvas
 * half-width. Caller is responsible for clamping/skipping sub-pixel rows.
 *
 * If `globalPeak` is 0 (silent audio), returns 0 — render nothing.
 */
export function computeRowHalfWidth(
  rowPeak: number,
  globalPeak: number,
  canvasHalfWidth: number,
): number {
  if (globalPeak <= 0) return 0;
  const normalized = rowPeak / globalPeak;
  return normalized * canvasHalfWidth * PEAK_FILL_RATIO;
}

export interface WaveformSurfaceConfig {
  /** Raw interleaved PCM audio data. */
  audioData: Float32Array;
  /** Number of audio channels (1 or 2). */
  channels: number;
  /** Total duration in milliseconds. */
  durationMs: number;
  /** Width of the highway mesh (0.9 for drums, 1.0 for guitar). */
  highwayWidth: number;
  /** Highway speed constant (units per second in world space). */
  highwaySpeed: number;
}

/**
 * Renders the audio waveform as a scrolling oscilloscope on the highway surface.
 *
 * Unlike the previous approach (pre-render entire song at low res), this
 * re-renders only the visible ~1.3-second window each frame at high
 * resolution. This matches Moonscraper's detailed waveform display where
 * individual transients (snare hits, kick hits) are clearly visible as
 * peaks extending from the center line.
 */
export class WaveformSurface {
  private mesh: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private material: THREE.MeshBasicMaterial;

  private audioData: Float32Array;
  private channels: number;
  private sampleRate: number;
  private durationMs: number;
  private highwaySpeed: number;
  private lastRenderedMs = -1;
  /**
   * Loudest absolute sample value across the entire audio buffer. Used to
   * normalize the per-row amplitudes so the visual peak fills a consistent
   * fraction of the highway regardless of overall loudness. Computed once at
   * construction with a single pass over the PCM (a few hundred ms for a
   * 4-minute stereo song at 48kHz).
   */
  private globalPeak: number;

  constructor(config: WaveformSurfaceConfig) {
    this.audioData = config.audioData;
    this.channels = config.channels;
    this.durationMs = config.durationMs;
    this.highwaySpeed = config.highwaySpeed;
    this.globalPeak = computeGlobalPeak(config.audioData);

    // Derive sample rate from total samples and duration
    const totalSamples = config.audioData.length / config.channels;
    this.sampleRate = totalSamples / (config.durationMs / 1000);

    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      depthTest: false,
      // Transparent so the gray highway floor shows through rows without
      // audio peaks. The canvas is cleared each frame (no opaque black
      // fill) to honour this.
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(config.highwayWidth, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = -0.1;
    // Render above the highway floor (HIGHWAY_FLOOR_RENDER_ORDER = 0) so
    // the gray plane stays visible at the edges as a frame, but below
    // markers / notes / cursor.
    this.mesh.renderOrder = 1;
    this.mesh.visible = false;
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Called every frame. Re-renders the waveform canvas for the currently
   * visible time window and marks the texture as needing upload.
   */
  update(currentTimeMs: number): void {
    // The highway plane spans 2 world units. At highwaySpeed, that
    // corresponds to windowMs of visible time.
    const windowMs = (2 / this.highwaySpeed) * 1000;

    // The strikeline is at the bottom of the highway (world y = -1).
    // currentTimeMs is at the strikeline. The top of the highway shows
    // currentTimeMs + windowMs.
    const startMs = currentTimeMs;
    const endMs = currentTimeMs + windowMs;

    // Quantise to the nearest ms to avoid re-drawing on sub-ms changes
    const quantised = Math.round(startMs);
    if (quantised === this.lastRenderedMs) return;
    this.lastRenderedMs = quantised;

    this.renderWindow(startMs, endMs);
    this.texture.needsUpdate = true;
  }

  setVisible(visible: boolean): void {
    this.mesh.visible = visible;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }

  // -----------------------------------------------------------------------
  // Oscilloscope-style waveform rendering for the visible window
  // -----------------------------------------------------------------------

  private renderWindow(startMs: number, endMs: number): void {
    const ctx = this.ctx;
    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    const centerX = w / 2;

    // Clear to fully transparent so the highway floor shows through
    // anywhere we don't draw a peak.
    ctx.clearRect(0, 0, w, h);

    // Convert time range to sample range
    const startSample = Math.max(
      0,
      Math.floor((startMs / 1000) * this.sampleRate),
    );
    const endSample = Math.min(
      Math.floor((endMs / 1000) * this.sampleRate),
      this.audioData.length / this.channels,
    );
    const totalWindowSamples = endSample - startSample;
    if (totalWindowSamples <= 0) return;

    // How many audio samples per canvas row
    const samplesPerRow = totalWindowSamples / h;

    // Draw waveform: for each row, find the peak amplitude and draw a
    // horizontal line extending from the center. This gives the oscilloscope
    // look where louder parts have wider peaks (like Moonscraper).
    ctx.fillStyle = WAVE_COLOR;

    for (let row = 0; row < h; row++) {
      const rowStartSample = startSample + Math.floor(row * samplesPerRow);
      const rowEndSample = startSample + Math.floor((row + 1) * samplesPerRow);

      // Find min/max amplitude across all channels for this row
      let minVal = 0;
      let maxVal = 0;
      for (let s = rowStartSample; s < rowEndSample && s < endSample; s++) {
        for (let c = 0; c < this.channels; c++) {
          const val = this.audioData[s * this.channels + c];
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      }

      // Normalize against the global peak so the loudest sample in the song
      // fills PEAK_FILL_RATIO of the highway half-width. Quiet sections still
      // remain proportionally smaller, but loud sections reliably fill the
      // highway instead of being clipped to a fraction of it.
      const peak = Math.max(Math.abs(minVal), Math.abs(maxVal));
      const halfWidth = computeRowHalfWidth(peak, this.globalPeak, centerX);

      if (halfWidth < 0.5) continue;

      // Canvas y: row 0 = top of canvas = end of time window (top of highway)
      // row h-1 = bottom of canvas = start of time window (strikeline)
      const y = h - 1 - row;

      ctx.fillRect(centerX - halfWidth, y, halfWidth * 2, 1);
    }
  }
}
