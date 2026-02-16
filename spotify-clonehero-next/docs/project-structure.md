# Project Structure

This document outlines the file structure of the `spotify-clonehero-next` project to help developers navigate the codebase.

## Root Directory

-   `package.json`: Project dependencies and scripts.
-   `CONTRIBUTING.md`: Coding standards and guidelines.
-   `README.md`: Project overview and setup.
-   `next.config.js`: Next.js configuration.
-   `tsconfig.json`: TypeScript configuration.

## `app/` (Next.js App Router)

The main application logic and routing.

-   `page.tsx`: Landing page (Dashboard).
-   `layout.tsx`: Root layout (Theme provider, Toaster).
-   `globals.css`: Global styles (Tailwind directives).

### Routes
-   `sheet-music/`
    -   `Search.tsx`: Search interface for charts.
    -   `[slug]/`: The main player view.
        -   `page.tsx`: Route handler.
        -   `SongView.tsx`: Main container for the player UI.
        -   `SheetMusic.tsx`: VexFlow wrapper component.
        -   `CloneHeroRenderer.tsx`: Canvas renderer for the game view (highway).
-   `spotify/`: Spotify Library Scanner (Beta).
-   `spotifyhistory/`: Extended Streaming History tool.
-   `updates/`: Chart updater tool.

## `lib/` (Core Logic)

Business logic and utilities unrelated to UI components.

-   `chorusChartDb/`: Logic for syncing with enchor.us.
    -   `index.ts`: Main hook `useChorusChartDb`.
    -   `database.ts`: Kysely/SQLite implementation.
-   `fill-detector/`: Drum fill analysis algorithm.
    -   `index.ts`: Main entry point `extractFills`.
-   `local-db/`: In-browser SQLite database (sqlocal).
    -   `client.ts`: Database connection and optimization.
    -   `types.ts`: Database schema.
-   `spotify-sdk/`: Typed wrapper around Spotify Web API.
-   `fileSystemHelpers.ts`: Utilities for File System Access API.

## `components/` (UI Library)

Reusable React components.

-   `ui/`: Shadcn UI primitives (Button, Card, Dialog, etc.).
-   `ChartInstruments.tsx`: Badges for displaying available instruments in a chart.
-   `EncoreAutocomplete.tsx`: Search bar for matching Spotify songs to Charts.

## `docs/` (Documentation)

-   `architecture.md`: High-level system design.
-   `features/`: Detailed feature documentation.
-   `patterns/`: Design patterns (e.g., Long Running Hooks).
