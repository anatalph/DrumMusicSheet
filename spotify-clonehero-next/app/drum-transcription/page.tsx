import DrumTranscriptionClient from './DrumTranscriptionClient';

// No per-page metadata: the feature isn't shipped yet, so we don't
// want unfurl cards advertising it. The route still works for
// development; it just inherits the site-wide title/description.

export default function Page() {
  return <DrumTranscriptionClient />;
}
