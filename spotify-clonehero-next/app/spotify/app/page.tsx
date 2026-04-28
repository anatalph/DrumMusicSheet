import dynamic from 'next/dynamic';

const Spotify = dynamic(() => import('./Spotify'));

export const metadata = {
  title: 'Spotify Chart Finder',
  description:
    'Find Clone Hero charts for songs in your Spotify library. Runs entirely in your browser.',
};

export default function Page() {
  return <Spotify />;
}
