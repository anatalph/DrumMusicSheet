/**
 * @jest-environment jsdom
 */

import {AudioManager} from '../audioManager';

/**
 * Minimal Web Audio mocks. The real AudioManager constructor decodes audio,
 * loads a worklet, and creates buffer sources. We stub just enough to let
 * us exercise `seekTo()` without actually wiring up a real audio graph.
 */

class FakeAudioParam {
  value = 1;
  setValueAtTime(v: number) {
    this.value = v;
  }
}

class FakeAudioBufferSource {
  buffer: unknown = null;
  playbackRate = new FakeAudioParam();
  connect() {}
  disconnect() {}
  start() {}
  stop() {}
  addEventListener() {}
  removeEventListener() {}
}

class FakeGainNode {
  gain = new FakeAudioParam();
  connect() {}
  disconnect() {}
}

class FakeWorkletNode {
  parameters = {
    get(name: string) {
      void name;
      return new FakeAudioParam();
    },
  };
  connect() {}
}

class FakeAudioContext {
  state: 'running' | 'suspended' | 'closed' = 'suspended';
  currentTime = 0;
  baseLatency = 0;
  outputLatency = 0;
  destination = {} as AudioNode;
  audioWorklet = {
    addModule: jest.fn().mockResolvedValue(undefined),
  };
  createBufferSource() {
    return new FakeAudioBufferSource() as unknown as AudioBufferSourceNode;
  }
  createGain() {
    return new FakeGainNode() as unknown as GainNode;
  }
  decodeAudioData(_buf: ArrayBuffer): Promise<AudioBuffer> {
    return Promise.resolve({duration: 60, length: 60} as AudioBuffer);
  }
  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend(): Promise<void> {
    this.state = 'suspended';
    return Promise.resolve();
  }
  close(): Promise<void> {
    this.state = 'closed';
    return Promise.resolve();
  }
}

beforeAll(() => {
  // @ts-expect-error - test stub
  global.AudioContext = FakeAudioContext;
  // @ts-expect-error - test stub
  global.AudioWorkletNode = FakeWorkletNode;
  // requestAnimationFrame isn't strictly needed here (we only test the
  // paused path), but keep a no-op stub so the constructor doesn't crash
  // if anything schedules a frame.
  global.requestAnimationFrame =
    global.requestAnimationFrame ??
    ((cb: FrameRequestCallback) => {
      void cb;
      return 0;
    });
  global.cancelAnimationFrame = global.cancelAnimationFrame ?? (() => {});
});

async function makeAudioManager(): Promise<AudioManager> {
  const am = new AudioManager(
    [{fileName: 'song.ogg', data: new Uint8Array(8)}],
    () => {},
  );
  await am.ready;
  return am;
}

describe('AudioManager.seekTo', () => {
  test('paused: updates currentTime without starting playback', async () => {
    const am = await makeAudioManager();
    expect(am.isPlaying).toBe(false);
    expect(am.currentTime).toBe(0);

    await am.seekTo(12.5);

    expect(am.isPlaying).toBe(false);
    expect(am.currentTime).toBeCloseTo(12.5, 5);
  });

  test('paused: chart-time variant respects chartDelay', async () => {
    const am = await makeAudioManager();
    am.setChartDelay(2);

    await am.seekToChartTime(10);

    expect(am.isPlaying).toBe(false);
    // currentTime is the audio time = chartTime + delay
    expect(am.currentTime).toBeCloseTo(12, 5);
    // chartTime is what the caller asked for
    expect(am.chartTime).toBeCloseTo(10, 5);
  });

  test('seeking while paused multiple times keeps state paused', async () => {
    const am = await makeAudioManager();

    await am.seekTo(5);
    await am.seekTo(20);
    await am.seekTo(0.5);

    expect(am.isPlaying).toBe(false);
    expect(am.currentTime).toBeCloseTo(0.5, 5);
  });

  test('playing: seekTo keeps playing (delegates to play)', async () => {
    const am = await makeAudioManager();
    await am.play({time: 1});
    expect(am.isPlaying).toBe(true);

    await am.seekTo(30);

    expect(am.isPlaying).toBe(true);
    expect(am.currentTime).toBeCloseTo(30, 1);
  });
});
