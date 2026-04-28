import type {Metadata} from 'next';
import ChartReviewClient from './ChartReviewClient';

// Title + description only — root layout's openGraph/twitter blocks
// pick up the rest. See app/layout.tsx for the merge rules.
export const metadata: Metadata = {
  title: 'Review drum charts',
  description:
    'Batch-review drum chart quality with a preloaded highway preview.',
};

export default function Page() {
  return <ChartReviewClient />;
}
