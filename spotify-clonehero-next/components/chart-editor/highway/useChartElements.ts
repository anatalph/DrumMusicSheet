'use client';

/**
 * Push the active chart's elements (notes + markers) to the SceneReconciler.
 *
 * Three responsibilities, three effects:
 *
 *   1. **Element set push** — derive `ChartElement[]` from the chart and
 *      capabilities. Element data is intrinsic-only (text, lane, length,
 *      msTime); transient state lives elsewhere. Marker drag injects a
 *      live `msTime` so the dragged marker tracks the cursor; the
 *      reconciler treats this as reposition-only because `dataEqual`
 *      ignores msTime.
 *
 *   2. **Hover push** — translate `state.hovered` (`{kind, id} | null`) to
 *      a reconciler key via `reconcilerKeyFor` and call
 *      `reconciler.setHoveredKey`. One push site so mouse and drag don't
 *      race each other through the renderer.
 *
 *   3. **Selection push** — translate per-kind selection sets to a single
 *      `Set<reconciler-key>` and call `reconciler.setSelectedKeys`. Notes
 *      ride the same dispatch path as marker entities.
 */

import {useEffect, type RefObject} from 'react';
import type {parseChartFile} from '@eliwhite/scan-chart';
import type {
  ChartElement,
  SceneReconciler,
} from '@/lib/preview/highway/SceneReconciler';

/**
 * Parser-shape ParsedChart. Differs from scan-chart's wrapper type in
 * that it lacks `chartBytes` / `format` / `iniChartModifiers` — those
 * come from the consumer's `ChartDocument`. The editor's reducer state
 * stores this narrower shape.
 */
type ParsedChart = ReturnType<typeof parseChartFile>;
import type {EntityKind} from '@/lib/chart-edit';
import type {TimedTempo} from '@/lib/drum-transcription/chart-types';
import {tickToMs} from '@/lib/drum-transcription/timing';
import {findTrackInParsedChart} from '@/lib/chart-edit';
import {chartToElements} from '@/lib/preview/highway/chartToElements';
import {
  markerDragReconcilerKey,
  reconcilerKeyFor,
} from '@/lib/preview/highway/reconcilerKey';
import type {EditorCapabilities} from '../capabilities';
import type {EditorScope} from '../scope';
import {trackKeyFromScope} from '../scope';
import type {MarkerKind} from './useMarkerDrag';

export interface MarkerDragHint {
  kind: MarkerKind;
  originalTick: number;
  currentTick: number;
}

export interface UseChartElementsInputs {
  reconcilerRef: RefObject<SceneReconciler | null>;
  /**
   * Bumped when the renderer handle is swapped out (re-mount). Drives
   * the "first reconciler push after mount" path.
   */
  rendererVersion: number;
  chart: ParsedChart | null;
  activeScope: EditorScope;
  /** Active vocal part. `vocals` for non-vocals scopes. */
  partName: string;
  capabilities: EditorCapabilities;
  /** Per-entity-kind selection from the editor reducer. */
  selection: ReadonlyMap<EntityKind, ReadonlySet<string>>;
  /** Single hovered entity from the editor reducer (or null). */
  hovered: {kind: EntityKind; id: string} | null;
  markerDrag: MarkerDragHint | null;
  timedTempos: TimedTempo[];
  resolution: number;
}

/**
 * Pure inputs for `computeChartElements`. The element-set computation is
 * factored out as a side-effect-free function so it can be unit-tested
 * directly without renderHook + a mocked reconciler.
 */
export interface ComputeChartElementsInputs {
  chart: ParsedChart;
  activeScope: EditorScope;
  partName: string;
  capabilities: EditorCapabilities;
  markerDrag: MarkerDragHint | null;
  timedTempos: TimedTempo[];
  resolution: number;
}

/**
 * Pure: derive the `ChartElement[]` to push to the reconciler from the
 * current chart + capabilities + marker-drag hint. No React, no refs.
 *
 * Drag handling: when a marker is being dragged, its element is rewritten
 * with a live `msTime` derived from `markerDrag.currentTick`. The
 * reconciler's `dataEqual` ignores `msTime`, so this becomes a
 * reposition-only update — no recycle, no key churn.
 *
 * Lane-axis (note) drags don't appear here: notes are committed through
 * the command pipeline before the next push, so the reconciler always
 * sees their final position.
 */
export function computeChartElements(
  inputs: ComputeChartElementsInputs,
): ChartElement[] {
  const {
    chart,
    activeScope,
    partName,
    capabilities,
    markerDrag,
    timedTempos,
    resolution,
  } = inputs;
  const trackKey = trackKeyFromScope(activeScope);
  const track = trackKey
    ? (findTrackInParsedChart(chart, trackKey)?.track ?? null)
    : null;
  const elements = chartToElements(chart, track, partName);

  const dragKey = markerDrag
    ? markerDragReconcilerKey(
        markerDrag.kind,
        markerDrag.originalTick,
        partName,
      )
    : null;
  const dragMs =
    markerDrag && timedTempos.length > 0
      ? tickToMs(markerDrag.currentTick, timedTempos, resolution)
      : null;

  return elements
    .filter(e => capabilities.showDrumLanes || e.kind !== 'note')
    .map(e => {
      if (dragKey === e.key && dragMs !== null) {
        return {...e, msTime: dragMs};
      }
      return e;
    });
}

/**
 * Effect-only hook. Pushes a fresh element set to the reconciler on every
 * input change; pushes hover/selection through dedicated dispatch
 * channels (no longer baked into element data).
 */
export function useChartElements(inputs: UseChartElementsInputs): void {
  const {
    reconcilerRef,
    rendererVersion,
    chart,
    activeScope,
    partName,
    capabilities,
    selection,
    hovered,
    markerDrag,
    timedTempos,
    resolution,
  } = inputs;

  // ---------------------------------------------------------------------
  // 1. Element-set push.
  //    Intrinsic-only data; drag injects msTime which the reconciler
  //    treats as reposition-only.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const reconciler = reconcilerRef.current;
    if (!reconciler || !chart) return;
    reconciler.setElements(
      computeChartElements({
        chart,
        activeScope,
        partName,
        capabilities,
        markerDrag,
        timedTempos,
        resolution,
      }),
    );
  }, [
    reconcilerRef,
    rendererVersion,
    chart,
    activeScope,
    partName,
    capabilities,
    markerDrag,
    timedTempos,
    resolution,
  ]);

  // ---------------------------------------------------------------------
  // 2. Hover push. Single source of truth: state.hovered → reconciler.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const reconciler = reconcilerRef.current;
    if (!reconciler) return;
    const key = hovered
      ? reconcilerKeyFor(hovered.kind, hovered.id, partName)
      : null;
    reconciler.setHoveredKey(key);
  }, [reconcilerRef, rendererVersion, hovered, partName]);

  // ---------------------------------------------------------------------
  // 3. Selection push. Translate per-kind selection ids to reconciler
  //    keys and replace the reconciler's set.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const reconciler = reconcilerRef.current;
    if (!reconciler) return;
    const keys = new Set<string>();
    for (const [kind, ids] of selection) {
      for (const id of ids) {
        keys.add(reconcilerKeyFor(kind, id, partName));
      }
    }
    reconciler.setSelectedKeys(keys);
  }, [reconcilerRef, rendererVersion, selection, partName]);
}
