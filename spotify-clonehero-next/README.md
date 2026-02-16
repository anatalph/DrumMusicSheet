# Spotify CloneHero

Spotify CloneHero is a web-based toolset for Clone Hero players. It bridges the gap between your Spotify listening habits and your Clone Hero chart library.

## Features

-   **Spotify Integration**: Connect your Spotify account to find charts for songs you listen to.
-   **Local Library Management**: Manage your local `Songs` directory directly from the browser using the File System Access API.
-   **Fill Detector**: advanced analysis of drum charts to identify fills vs grooves.
-   **Sheet Music Viewer**: Visualize drum charts as sheet music with VexFlow.
-   **Chorus Sync**: Automatically syncs chart metadata from enchor.us.

## Documentation

-   [Architecture Overview](docs/architecture.md)
-   [Contributing Guidelines](CONTRIBUTING.md)
-   **Features**:
    -   [Fill Detector Logic](docs/features/fill-detector.md)
    -   [Local Database & Sync](docs/features/database.md)
    -   [Long Running Processes](docs/patterns/long-running-hooks.md)

## Getting Started

### Prerequisites

-   Node.js 20+
-   pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/spotify-clonehero-next.git
    cd spotify-clonehero-next
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Run the development server:
    ```bash
    pnpm dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

Built with [Next.js App Router](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Shadcn UI](https://ui.shadcn.com), and [SQLite (via sqlocal)](https://github.com/sqlocal/sqlocal).
