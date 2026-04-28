import type {Metadata} from 'next';
import AddLyricsClient from './AddLyricsClient';

// Per-page openGraph/twitter blocks would replace the root-layout
// blocks entirely (Next merges metadata field-by-field at the top
// level only). Setting just title + description here and letting Next
// auto-fill og:title / og:description / twitter:title / twitter:description
// keeps siteName, card type, and the auto-discovered og-image from the
// root layout intact.
export const metadata: Metadata = {
  title: 'Add lyrics to a chart',
  description:
    'Add timed, syllable-level lyrics to any Clone Hero chart. Runs entirely in your browser.',
};

export default function Page() {
  return <AddLyricsClient />;
}
