import type {Metadata} from 'next';
import DrumEditClient from './DrumEditClient';

// Title + description only — root layout's openGraph/twitter blocks
// pick up the rest. See app/layout.tsx for the merge rules.
export const metadata: Metadata = {
  title: 'Edit a drum chart',
  description:
    'Browser-based drum chart editor for Clone Hero — like Moonscraper, no install needed.',
};

export default function Page() {
  return <DrumEditClient />;
}
