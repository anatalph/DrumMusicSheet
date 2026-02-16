# Managing Songs

Spotify CloneHero is designed to work with your existing local library of Clone Hero charts. It uses the modern File System Access API to read files directly from your computer without uploading them to a server.

## 1. Setting up your Song Library

When you first use a tool that requires local charts (like the Sheet Music Viewer), the app will prompt you to select a folder.

1.  **Select Folder**: Choose the root folder where you keep your Clone Hero songs (e.g., `C:\Users\Name\Documents\Clone Hero\Songs`).
2.  **Permission**: The browser will ask for permission to "View files in..." or "Edit files in...". Click **Allow** or **Grant Access**.
    -   *Note*: The app needs `readwrite` access if you plan to download new charts or update existing ones.

## 2. Adding Local Songs

To add songs manually:

1.  **Download Charts**: Get charts from [Chorus](https://chorus.fightthe.pw/) or other sources.
2.  **Extract**: Unzip the downloaded chart into your selected Songs folder.
3.  **Rescan**:
    -   If the app doesn't see the new songs immediately, look for a "Rescan" button in the library view.
    -   Alternatively, refreshing the page will often trigger a quick scan of the folder.

## 3. Downloading Songs with Spotify Matcher

The **Spotify Library Scanner** tool helps you find charts for songs you already know and love.

1.  Navigate to the **Spotify Library Scanner** from the home page.
2.  **Login**: Connect your Spotify account to fetch your playlists.
3.  **Match**: The tool will compare your Spotify tracks against the Chorus database.
4.  **Download**:
    -   Click the download button next to a matched song.
    -   The app will download and extract the chart directly into a `musiccharts-dot-tools-downloads` subfolder within your selected Songs directory.

## 4. Updates

The **Updater** tool checks your local charts against the latest versions on Chorus.

1.  Go to the **Updater** tool.
2.  It will scan your library and highlight charts that have updates available.
3.  Click **Update** to replace the old chart files with the new version.
    -   *Backup*: The app attempts to backup the old version before overwriting, just in case.

## Troubleshooting

-   **"Permission Denied"**: Browsers reset file permissions for security. If you see this, click the lock icon in the address bar or reload the page to re-grant access.
-   **Missing Songs**: Ensure your charts are in a recognized format (`.chart` or `.mid` with a `song.ini`).
