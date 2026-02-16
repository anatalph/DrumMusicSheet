import { useCallback, useEffect, useRef, useState } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer?: string;
}

export interface MidiMessage {
  command: number;
  note: number;
  velocity: number;
  timestamp: number;
}

export function useMidiInput() {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [lastNote, setLastNote] = useState<MidiMessage | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);
  // Keep track of the selected input so we can remove listeners when switching
  const currentInputRef = useRef<WebMidi.MIDIInput | null>(null);

  const onMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
    const [status, note, velocity] = event.data;
    // Command is the upper 4 bits
    const command = status >> 4;
    // Channel is the lower 4 bits
    // const channel = status & 0xf;

    // Note On (144) or Note Off (128)
    // Some devices send Note On with velocity 0 for Note Off
    if (command === 9 && velocity > 0) {
      setLastNote({
        command,
        note,
        velocity,
        timestamp: event.timeStamp,
      });
    }
  }, []);

  const updateDevices = useCallback(() => {
    if (!midiAccessRef.current) return;

    const inputs: MidiDevice[] = [];
    midiAccessRef.current.inputs.forEach(input => {
      inputs.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer,
      });
    });
    setDevices(inputs);

    // Auto-select first device if none selected
    if (inputs.length > 0 && !selectedDeviceId) {
      // Don't auto-select here to avoid react render loops, let the effect handle it
      // But we can check if the currently selected one is gone?
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      setIsSupported(false);
      setError('Web MIDI API is not supported in this browser.');
      return;
    }

    navigator
      .requestMIDIAccess()
      .then(access => {
        midiAccessRef.current = access;
        updateDevices();

        access.onstatechange = (e) => {
          updateDevices();
        };
      })
      .catch(err => {
        console.error('MIDI Access Failed', err);
        setError('Failed to access MIDI devices. Check permissions.');
      });

    return () => {
      if (currentInputRef.current) {
        currentInputRef.current.onmidimessage = null;
      }
    };
  }, [updateDevices]);

  // Handle device selection and listener attachment
  useEffect(() => {
    if (!midiAccessRef.current) return;

    // Cleanup previous listener
    if (currentInputRef.current) {
      currentInputRef.current.onmidimessage = null;
      currentInputRef.current = null;
    }

    if (selectedDeviceId) {
      const input = midiAccessRef.current.inputs.get(selectedDeviceId);
      if (input) {
        input.onmidimessage = onMidiMessage;
        currentInputRef.current = input;
      }
    } else if (devices.length > 0) {
      // Auto-select the first one if logic dictates
      // For now, let's just default to the first one available if user hasn't picked
      const firstInput = midiAccessRef.current.inputs.values().next().value;
      if (firstInput) {
        setSelectedDeviceId(firstInput.id);
      }
    }
  }, [selectedDeviceId, devices, onMidiMessage]);

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    lastNote,
    isSupported,
    error,
  };
}
