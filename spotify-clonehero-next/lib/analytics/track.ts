import {sendGAEvent} from '@next/third-parties/google';

export type AnalyticsEvent =
  // Library scan / downloads
  | {event: 'charts_scanned'; value: number}
  | {
      event: 'chart_downloaded';
      source:
        | 'spotify'
        | 'spotify_history'
        | 'sheet_music'
        | 'karaoke'
        | 'unknown';
      format: 'sng' | 'chart';
      md5?: string;
    }

  // Spotify pages
  | {
      event: 'spotify_instrument_filter_changed';
      instruments: string;
      count: number;
    }
  | {event: 'spotify_hide_downloaded_toggled'; enabled: boolean}

  // Sheet music
  | {
      event: 'sheet_music_loaded';
      slug: string;
      instrument: string;
      difficulty: string;
      hasAudio: boolean;
      hasVideo: boolean;
    }
  | {event: 'sheet_music_play'}
  | {event: 'sheet_music_pause'}
  | {event: 'sheet_music_speed_changed'; speed: number}
  | {event: 'sheet_music_zoom_changed'; zoom: number}
  | {event: 'sheet_music_difficulty_changed'; difficulty: string}
  | {event: 'sheet_music_clone_hero_toggled'; enabled: boolean}
  | {event: 'sheet_music_click_track_toggled'; enabled: boolean}
  | {event: 'sheet_music_show_lyrics_toggled'; enabled: boolean}
  | {event: 'sheet_music_show_bar_numbers_toggled'; enabled: boolean}
  | {event: 'sheet_music_enable_colors_toggled'; enabled: boolean}
  | {event: 'sheet_music_practice_section_saved'}
  | {event: 'sheet_music_favorited'}
  | {event: 'sheet_music_unfavorited'}
  | {event: 'sheet_music_playback_session'; playSeconds: number}

  // Add-lyrics
  | {event: 'add_lyrics_chart_loaded'; sourceFormat: 'folder' | 'sng' | 'zip'}
  | {event: 'add_lyrics_align_started'}
  | {event: 'add_lyrics_align_completed'; totalMs: number}
  | {event: 'add_lyrics_align_failed'; step: string}
  | {event: 'add_lyrics_realign'}
  | {
      event: 'add_lyrics_exported';
      format: 'sng' | 'zip';
      manualMoveCount: number;
    };

// `sendGAEvent` flattens object params onto the GA4 `event` payload, so a
// typed wrapper is enough — no per-event parameter mapping needed.
export function track(payload: AnalyticsEvent): void {
  try {
    sendGAEvent(payload);
  } catch {
    // Analytics never throws into product code.
  }
}

// Stitches sessions across devices for logged-in users. Pass null on
// sign-out to clear. UUID only (no email/PII).
export function setAnalyticsUserId(userId: string | null): void {
  try {
    window.gtag?.('set', {user_id: userId ?? undefined});
  } catch {
    // ignore
  }
}
