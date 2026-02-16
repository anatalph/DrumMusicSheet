'use client';

import { MidiConnectionStatus } from '@/components/MidiConnectionStatus';
import { Button } from '@/components/ui/button';
import { MidiMessage, useMidiInput } from '@/lib/hooks/useMidiInput';
import { getDrumInstrumentFromMidi } from '@/lib/midi-mapping';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MidiTestPage() {
  const midi = useMidiInput();
  const [messageLog, setMessageLog] = useState<MidiMessage[]>([]);
  const [activeDrums, setActiveDrums] = useState<Set<string>>(new Set());

  // Keep log size manageable
  useEffect(() => {
    if (midi.lastNote) {
      setMessageLog(prev => [midi.lastNote!, ...prev].slice(0, 20));

      const instrument = getDrumInstrumentFromMidi(midi.lastNote.note);
      if (instrument) {
        setActiveDrums(prev => {
          const newSet = new Set(prev);
          newSet.add(instrument);
          return newSet;
        });

        // Clear active state after a short delay
        setTimeout(() => {
          setActiveDrums(prev => {
            const newSet = new Set(prev);
            newSet.delete(instrument);
            return newSet;
          });
        }, 150);
      }
    }
  }, [midi.lastNote]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">MIDI Connect Test</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Connection & Log Section */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <MidiConnectionStatus
                  devices={midi.devices}
                  selectedDeviceId={midi.selectedDeviceId}
                  onSelectDevice={midi.setSelectedDeviceId}
                  isSupported={midi.isSupported}
                />
              </div>
              {midi.selectedDeviceId && (
                <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  ✓ Device Connected
                </div>
              )}
              {!midi.isSupported && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                  ✕ Web MIDI API not supported
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm h-[400px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Input Log</h2>
            <div className="flex-1 overflow-y-auto font-mono text-sm border rounded-md p-4 bg-muted/50">
                {messageLog.length === 0 ? (
                    <div className="text-muted-foreground italic text-center pt-8">
                        No MIDI messages received yet...
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messageLog.map((msg, i) => {
                            const instrument = getDrumInstrumentFromMidi(msg.note);
                            return (
                                <div key={msg.timestamp + i} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
                                    <span>
                                        Note: <span className="font-bold text-primary">{msg.note}</span>
                                        {instrument && <span className="text-muted-foreground ml-2">({instrument})</span>}
                                    </span>
                                    <span className="text-muted-foreground">Vel: {msg.velocity}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center relative min-h-[500px]">
            <h2 className="text-xl font-semibold absolute top-6 left-6">Visualizer</h2>

            {/* Simple Drum Kit Layout */}
            <div className="relative w-full h-[400px]">
                {/* Cymbals (Top) */}
                <DrumPad
                    active={activeDrums.has('crash')}
                    label="Crash"
                    className="absolute top-10 left-10 w-24 h-24 rounded-full bg-yellow-500/20 border-yellow-500"
                />
                <DrumPad
                    active={activeDrums.has('ride')}
                    label="Ride"
                    className="absolute top-10 right-10 w-24 h-24 rounded-full bg-blue-500/20 border-blue-500"
                />
                <DrumPad
                    active={activeDrums.has('hihat')}
                    label="Hi-Hat"
                    className="absolute top-20 left-1/3 w-20 h-20 rounded-full bg-yellow-300/20 border-yellow-300"
                />

                {/* Toms (Middle) */}
                <DrumPad
                    active={activeDrums.has('high-tom')}
                    label="High Tom"
                    className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-red-400/20 border-red-400"
                />
                <DrumPad
                    active={activeDrums.has('mid-tom')}
                    label="Mid Tom"
                    className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-red-500/20 border-red-500"
                />
                <DrumPad
                    active={activeDrums.has('floor-tom')}
                    label="Floor Tom"
                    className="absolute bottom-1/3 right-10 w-24 h-24 rounded-full bg-red-600/20 border-red-600"
                />

                {/* Snare (Center-Left) */}
                <DrumPad
                    active={activeDrums.has('snare')}
                    label="Snare"
                    className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full bg-slate-400/20 border-slate-400"
                />

                {/* Kick (Bottom Center) */}
                <DrumPad
                    active={activeDrums.has('kick')}
                    label="Kick"
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-orange-600/20 border-orange-600"
                />
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Hit your drums to verify the mapping.</p>
                <p>If hits appear but map to the wrong instrument, we may need to adjust the MIDI map.</p>
            </div>
        </div>
      </div>
    </div>
  );
}

function DrumPad({ active, label, className }: { active: boolean; label: string; className?: string }) {
    return (
        <div className={cn(
            "flex items-center justify-center border-4 transition-all duration-75",
            active ? "bg-opacity-80 scale-110 shadow-[0_0_30px_rgba(255,255,255,0.5)] bg-white text-black font-bold" : "text-muted-foreground",
            className
        )}>
            {label}
        </div>
    );
}
