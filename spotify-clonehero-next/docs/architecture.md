# Architecture Overview

Spotify CloneHero is a client-side heavy Next.js application designed to run almost entirely in the browser. It leverages modern browser capabilities like the File System Access API and Origin Private File System (OPFS) to manage large datasets and local files without a traditional backend database.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS, Shadcn UI (Radix Primitives), Lucide React
- **State/Data**:
    - **SQLite (Browser)**: `sqlocal` (SQLite over OPFS) + `kysely` (Query Builder)
    - **Local Files**: File System Access API
    - **Remote Sync**: Fetch API (Chorus Data) + Spotify Web API SDK
- **Domain Logic**:
    - **Audio/Charts**: `vexflow` (Sheet Music), `midifile`, `parse-sng`, `audio-decode`
    - **Analysis**: Custom Fill Detector logic

## System Diagram

```mermaid
graph TD
    User[User] --> UI[Next.js UI]
    UI --> SpotifySDK[Spotify SDK]
    UI --> LocalDB[Local SQLite (OPFS)]
    UI --> FillDetector[Fill Detector]
    UI --> SheetMusic[Sheet Music Viewer]

    SpotifySDK --> SpotifyAPI[Spotify API]

    LocalDB --> ChorusData[Chorus Data Sync]
    ChorusData --> Enchorus[enchor.us]

    UI --> LocalFS[Local File System]
    LocalFS --> SongsDir[Clone Hero Songs Dir]
```

## Core Modules

### 1. Local Database (`lib/local-db`)
The application maintains a relational database inside the user's browser using SQLite (via `sqlocal`). This database caches:
- **Chorus Charts**: The entire catalog of charts from enchor.us.
- **Spotify Library**: Lists of user's playlists, albums, and tracks.
- **Matches**: Associations between Spotify tracks and Chorus charts.

### 2. Chorus Chart Sync (`lib/chorusChartDb`)
Responsible for keeping the local chart database in sync with upstream servers.
- Fetches incremental updates (JSON dumps).
- Merges updates into the local SQLite database (or legacy JSON files in OPFS).
- Supports large dataset handling without blocking the main thread.

### 3. Fill Detector (`lib/fill-detector`)
A specialized module for analyzing drum charts.
- **Input**: Parsed chart data.
- **Process**:
    - Segmentation / Windowing
    - Feature Extraction (Density, Gaps, Syncopation)
    - Heuristic Analysis (Groove vs Fill)
- **Output**: Detected "Fill Segments" for usage in the Sheet Music Viewer.

## Feature Architectures

### Song View / Sheet Music

The `SongView` component orchestrates several complex systems:

```mermaid
graph TD
    SongView[SongView Orchestrator]

    subgraph "Audio & Sync"
        AudioManager[Audio Manager]
        Playhead[Playhead Sync]
    end

    subgraph "Visuals"
        VexFlow[SheetMusic (VexFlow)]
        Highway[CloneHeroRenderer (Canvas)]
        Lyrics[Lyrics Overlay]
    end

    subgraph "Analysis"
        ScanChart[scan-chart Parser]
        FillDetector[Fill Detector]
    end

    SongView --> ScanChart
    ScanChart --> FillDetector

    SongView --> AudioManager
    AudioManager --> Playhead

    SongView --> VexFlow
    SongView --> Highway

    Playhead -.-> VexFlow
    Playhead -.-> Highway
```

## Data Flow

1.  **Initialization**: On load, the app initializes `sqlocal` and checks for schema migrations.
2.  **Sync**: It checks a remote endpoint for the latest chart data version. If outdated, it fetches differences and updates the local SQLite DB.
3.  **User Interaction**:
    -   **Spotify**: User logs in; app fetches playlists and caches them locally.
    -   **Matching**: App queries the local DB to find charts matching Spotify tracks (fuzzy matching on Artist/Title).
    -   **Sheet Music**: User selects a song; app parses the local `.sng` or `.mid` file, runs the Fill Detector, and renders the music using VexFlow.
