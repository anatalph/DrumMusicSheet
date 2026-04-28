import SpotifyHistory from './SpotifyHistory';

export const metadata = {
  title: 'Spotify History Chart Finder',
  description:
    'Find Clone Hero charts for every song in your Spotify Extended Streaming History. Runs entirely in your browser.',
};

export default function Page() {
  return <SpotifyHistory />;
}
