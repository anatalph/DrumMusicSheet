import type {Metadata} from 'next';
import DrumTranscriptionClient from './DrumTranscriptionClient';

// Title + description only — root layout's openGraph/twitter blocks
// pick up the rest. See app/layout.tsx for the merge rules.
export const metadata: Metadata = {
  title: 'Transcribe drums from audio',
  description:
    'Upload a song, get a Clone Hero drum chart. AI stem-separation and transcription, all in your browser.',
};

export default function Page() {
  return <DrumTranscriptionClient />;
}
