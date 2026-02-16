# Fill Detector

The **Fill Detector** (`lib/fill-detector`) is a core algorithmic component of Spotify CloneHero. It uses heuristic analysis to identify "drum fills" within a rhythm game chart. This distinguishes between the main groove (repetitive beat) and fills (variations/breaks).

## How It Works

The detection process follows a multi-stage pipeline:

1.  **Parsing**: The chart parses `.sng` or `.mid` files into a proprietary internal format (`ParsedChart`).
2.  **Windowing**: The track is divided into sliding analysis windows (e.g., 1-beat or 2-beat windows).
3.  **Feature Extraction**: For each window, several metrics are calculated:
    -   **Density**: Note density compared to surrounding context.
    -   **Syncopation**: Off-beat note rhythm.
    -   **Instrument Usage**: Presence of toms, crashes, or lack of hi-hats (which often indicates a break from the groove).
4.  **Candidate Detection**: Windows exceeding certain thresholds (defined in `config.ts`) are marked as candidates.
5.  **Post-Processing**:
    -   **Merging**: Adjacent candidate windows are merged into single "Fill Segments".
    -   **Filtering**: Segments that are too short or statistically unlikely are removed.
    -   **Refinement**: Boundaries are snapped to musical grids.

## Configuration

The detector is highly configurable via `Config` objects. Default values (`defaultConfig`) can be overridden at runtime.

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `windowBeats` | Size of analysis window in beats | `1.0` |
| `strideBeats` | Step size for the sliding window | `0.25` |
| `thresholds.densityZ` | Min Z-score for density to flag a fill | `1.5` |
| `thresholds.gap` | Max gap (beats) to merge segments | `2.0` |

## Usage

```typescript
import { extractFills, defaultConfig } from '@/lib/fill-detector';

const fills = extractFills(parsedChart, {
  ...defaultConfig,
  thresholds: { densityZ: 1.2 } // Sensitivity tuning
});
```
