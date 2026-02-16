# Local Database & Chorus Sync

The application operates without a traditional backend database for user data. Instead, it builds a full featured data warehouse inside the user's browser using SQLite.

## Components

### 1. SQLocal (SQLite in WebAssembly)
We use `sqlocal` to run SQLite backed by the **Origin Private File System (OPFS)**. This provides:
-   **Persistence**: Data survives page reloads and browser restarts.
-   **Performance**: OPFS is highly optimized for file I/O.
-   **SQL Capability**: Full relational queries using `kysely`.

### 2. Schema
The database schema (`lib/local-db/types.ts`) includes:

-   `chorus_charts`: ~60k+ records of charts from enchor.us.
    -   Columns: `md5`, `artist`, `name`, `diff_drums`, `charter`.
-   `spotify_playlists`, `spotify_albums`, `spotify_tracks`: Cached metadata from the user's Spotify account.
-   `local_charts`: Index of charts found in the user's local Clone Hero `Songs` directory.

### 3. Sync Process (`lib/chorusChartDb`)

To keep the `chorus_charts` table up to date without downloading a 100MB+ file every time:

1.  **Version Check**: App calls `/api/data` to get the current server data version.
2.  **Incremental Update**:
    -   Calculates the diff between local `lastRun` time and server time.
    -   Fetches only new/modified charts via `fetchNewCharts`.
3.  **Ingestion**:
    -   New charts are inserted/updated in SQLite.
    -   (Legacy) Also maintained in raw JSON chunks in OPFS for non-SQL usage.

## Database Access

Check `lib/local-db/client.ts` for connection logic.

```typescript
import { getLocalDb } from '@/lib/local-db/client';

const db = await getLocalDb();
const result = await db.selectFrom('chorus_charts')
  .selectAll()
  .where('artist', '=', 'Metallica')
  .execute();
```
