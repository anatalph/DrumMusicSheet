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
        }, 100);
      }
    }
  }, [midi.lastNote]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">MIDI Input Test</h1>
          </div>
          <div className="bg-[#2a2a2a] p-2 rounded-lg flex items-center gap-4">
             <span className="text-sm text-gray-400">Connection:</span>
             <MidiConnectionStatus
                  devices={midi.devices}
                  selectedDeviceId={midi.selectedDeviceId}
                  onSelectDevice={midi.setSelectedDeviceId}
                  isSupported={midi.isSupported}
                />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-150px)] min-h-[600px]">
           {/* Visualizer (Center/Left Focus) */}
           <div className="lg:col-span-2 relative bg-[#222] rounded-2xl shadow-2xl border border-[#333] overflow-hidden flex items-center justify-center">
                {/* Background Pattern or Gradient could go here */}

                <div className="relative w-[800px] h-[600px] scale-75 md:scale-90 lg:scale-100 origin-center transition-transform">

                    {/* Crash (Top Left) - Green */}
                    <DrumCircle
                        active={activeDrums.has('crash')}
                        label="CRASH"
                        size={140}
                        className="absolute top-[10%] left-[20%]"
                        activeColor="#27ae60" // green
                    />

                    {/* Ride (Top Right) - Blue */}
                    <DrumCircle
                        active={activeDrums.has('ride')}
                        label="RIDE"
                        size={140}
                        className="absolute top-[10%] right-[20%]"
                        activeColor="#2980b9" // blue
                    />

                    {/* Hi-Hat (Left) - Yellow */}
                    <DrumCircle
                        active={activeDrums.has('hihat')}
                        label="HI-HAT"
                        size={120}
                        className="absolute top-[35%] left-[10%]"
                        activeColor="#ffb142" // yellow
                    />
                    {/* Open Hi-Hat Indicator (Overlay or separate?) - For now treating generic HO/HC as hihat */}

                    {/* High Tom (Center Left) - Yellow */}
                    <DrumCircle
                        active={activeDrums.has('high-tom')}
                        label="HI TOM"
                        size={110}
                        className="absolute top-[30%] left-[38%]"
                        activeColor="#ffb142" // yellow
                    />

                    {/* Mid Tom (Center Right) - Blue */}
                    <DrumCircle
                        active={activeDrums.has('mid-tom')}
                        label="MID TOM"
                        size={110}
                        className="absolute top-[30%] right-[38%]"
                        activeColor="#2980b9" // blue
                    />

                    {/* Low Tom (Right) - Green */}
                    <DrumCircle
                        active={activeDrums.has('floor-tom')}
                        label="LOW TOM"
                        size={130}
                        className="absolute top-[45%] right-[15%]"
                        activeColor="#27ae60" // green
                    />

                    {/* Snare (Center Bottom) - Red */}
                    <DrumCircle
                        active={activeDrums.has('snare')}
                        label="SNARE"
                        size={130}
                        className="absolute top-[55%] left-1/2 -translate-x-1/2"
                        activeColor="#e74c3c" // red
                    />

                    {/* Kick (Pedal - Bottom Center) - Orange */}
                    <DrumPedal
                        active={activeDrums.has('kick')}
                        label="KICK"
                        className="absolute bottom-[5%] left-[55%] -translate-x-1/2"
                        activeColor="#ff793f" // orange
                    />

                    {/* Hi-Hat Pedal (Bottom Left) - Yellow */}
                    <DrumPedal
                        active={activeDrums.has('pedal-hihat') || activeDrums.has('hihat-pedal')}
                        label="PEDAL HH"
                        className="absolute bottom-[5%] left-[35%] -translate-x-1/2"
                        activeColor="#ffb142" // yellow
                    />

                </div>
           </div>

           {/* Log & Debug (Right Side) */}
           <div className="bg-[#2a2a2a] rounded-xl border border-[#333] p-4 flex flex-col h-full">
                <h2 className="text-lg font-semibold mb-4 text-gray-200 border-b border-[#444] pb-2">MIDI Event Log</h2>
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm pr-2 custom-scrollbar">
                    {messageLog.length === 0 ? (
                        <div className="text-gray-500 italic text-center mt-10">Waiting for input...</div>
                    ) : (
                        messageLog.map((msg, i) => {
                            const instrument = getDrumInstrumentFromMidi(msg.note);
                            return (
                                <div key={i} className="flex justify-between items-center bg-[#222] p-2 rounded border border-[#333]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#888]">{msg.note}</span>
                                        <span className={cn(
                                            "font-bold",
                                            instrument ? "text-yellow-400" : "text-gray-500"
                                        )}>
                                            {instrument?.toUpperCase() || 'UNKNOWN'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Vol: {msg.velocity}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function DrumCircle({
    active,
    label,
    size,
    className,
    activeColor = "#FFC107" // default yellow if not specified
}: {
    active: boolean;
    label: string;
    size: number;
    className?: string;
    activeColor?: string;
}) {
    return (
        <div
            className={cn("flex flex-col items-center justify-center transition-all duration-75 group", className)}
            style={{ width: size, height: size }}
        >
            <div
                className={cn(
                    "rounded-full w-full h-full flex items-center justify-center border-4 transition-all duration-75 relative",
                    // Hover effect for checking position
                    "group-hover:opacity-90",
                     !active && "bg-[#4a4a4a] border-[#3a3a3a]"
                )}
                style={active ? {
                    backgroundColor: activeColor,
                    borderColor: activeColor,
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 30px ${activeColor}66` // 40% opacity hex
                } : {}}
            >
                {/* Inner hole circle for style */}
                <div
                    className={cn("w-1/4 h-1/4 rounded-full")}
                    style={{ backgroundColor: active ? '#fff3' : '#2a2a2a' }}
                />
            </div>
            <span
                className={cn(
                    "absolute -bottom-8 font-bold text-sm tracking-wider transition-colors uppercase",
                     !active && "text-gray-400"
                )}
                style={active ? { color: activeColor } : {}}
            >
                {label}
            </span>
        </div>
    );
}

function DrumPedal({
    active,
    label,
    className,
    activeColor = "#FFC107"
}: {
    active: boolean;
    label: string;
    className?: string;
    activeColor?: string;
}) {
    return (
        <div className={cn("flex flex-col items-center group", className)}>
             <div
                className={cn(
                    "w-14 h-24 rounded-lg flex items-center justify-center border-4 transition-all duration-75",
                    !active && "bg-[#4a4a4a] border-[#3a4a4a]"
                )}
                style={active ? {
                    backgroundColor: activeColor,
                    borderColor: activeColor,
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 20px ${activeColor}66`
                } : {}}
             >
                <div
                    className={cn("w-full h-2 rounded-sm mx-1")}
                    style={{ backgroundColor: active ? '#fff3' : '#2a2a2a' }}
                />
             </div>
             <span
                className={cn(
                    "mt-2 font-bold text-sm tracking-wider transition-colors uppercase",
                    !active && "text-gray-400"
                )}
                style={active ? { color: activeColor } : {}}
            >
                {label}
            </span>
        </div>
    )
}
