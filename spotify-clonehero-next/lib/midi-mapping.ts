import { DrumNoteInstrument } from '@/app/sheet-music/[slug]/convertToVexflow';

// Standard General MIDI Drum Map (Level 1)
// https://www.midi.org/specifications-old/item/gm-level-1-sound-set
export const MIDI_DRUM_MAP: Record<number, DrumNoteInstrument> = {
  35: 'kick', // Acoustic Bass Drum
  36: 'kick', // Bass Drum 1
  38: 'snare', // Acoustic Snare
  40: 'snare', // Electric Snare
  37: 'snare', // Side Stick
  41: 'floor-tom', // Low Floor Tom
  43: 'floor-tom', // High Floor Tom
  45: 'mid-tom', // Low Tom
  47: 'mid-tom', // Low-Mid Tom
  48: 'high-tom', // Hi-Mid Tom
  50: 'high-tom', // High Tom
  42: 'hihat', // Closed Hi Hat
  44: 'hihat', // Pedal Hi Hat
  46: 'hihat', // Open Hi Hat
  49: 'crash', // Crash Cymbal 1
  57: 'crash', // Crash Cymbal 2
  51: 'ride', // Ride Cymbal 1
  59: 'ride', // Ride Cymbal 2
  52: 'ride', // Chinese Cymbal
  53: 'ride', // Ride Bell
  55: 'crash', // Splash Cymbal
};

export function getDrumInstrumentFromMidi(
  note: number,
): DrumNoteInstrument | null {
  return MIDI_DRUM_MAP[note] || null;
}
