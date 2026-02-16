interface Navigator {
  requestMIDIAccess(options?: WebMidi.MIDIOptions): Promise<WebMidi.MIDIAccess>;
}

declare namespace WebMidi {
  interface MIDIOptions {
    sysex?: boolean;
    software?: boolean;
  }

  interface MIDIAccess extends EventTarget {
    readonly inputs: MIDIInputMap;
    readonly outputs: MIDIOutputMap;
    onstatechange: ((this: MIDIAccess, e: MIDIConnectionEvent) => any) | null;
    readonly sysexEnabled: boolean;
  }

  type MIDIInputMap = Map<string, MIDIInput>;
  type MIDIOutputMap = Map<string, MIDIOutput>;

  interface MIDIPort extends EventTarget {
    readonly id: string;
    readonly manufacturer?: string;
    readonly name?: string;
    readonly type: MIDIPortType;
    readonly version?: string;
    readonly state: MIDIPortDeviceState;
    readonly connection: MIDIPortConnectionState;
    onstatechange: ((this: MIDIPort, e: MIDIConnectionEvent) => any) | null;
    open(): Promise<MIDIPort>;
    close(): Promise<MIDIPort>;
  }

  interface MIDIInput extends MIDIPort {
    onmidimessage: ((this: MIDIInput, e: MIDIMessageEvent) => any) | null;
  }

  interface MIDIOutput extends MIDIPort {
    send(data: Iterable<number>, timestamp?: number): void;
    clear(): void;
  }

  interface MIDIMessageEvent extends Event {
    readonly data: Uint8Array;
    readonly receivedTime: number;
  }

  interface MIDIConnectionEvent extends Event {
    readonly port: MIDIPort;
  }

  type MIDIPortType = 'input' | 'output';
  type MIDIPortDeviceState = 'disconnected' | 'connected';
  type MIDIPortConnectionState = 'open' | 'closed' | 'pending';
}
