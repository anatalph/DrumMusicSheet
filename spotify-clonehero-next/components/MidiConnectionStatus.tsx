import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MidiDevice } from '@/lib/hooks/useMidiInput';
import { Cable, PlugZap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MidiConnectionStatusProps {
  devices: MidiDevice[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  isSupported: boolean;
}

export function MidiConnectionStatus({
  devices,
  selectedDeviceId,
  onSelectDevice,
  isSupported,
}: MidiConnectionStatusProps) {
  const isConnected = selectedDeviceId !== null;
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Simple check for iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+ desktop mode
    setIsIOS(isIosDevice);
  }, []);

  if (!isSupported) {
    if (isIOS) {
       return (
        <Dialog>
             <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-yellow-600">
                    <PlugZap className="h-4 w-4" />
                    <span className="hidden sm:inline">iPad/iPhone?</span>
                </Button>
             </DialogTrigger>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>iOS MIDI Support</DialogTitle>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                     <p className="text-sm">
                         Apple does not support Web MIDI in Safari or Chrome on iOS.
                     </p>
                     <p className="text-sm font-medium">
                         To connect your drums on iPad/iPhone, you must use a specialized browser app.
                     </p>
                     <div className="bg-muted p-3 rounded-md text-sm">
                         Search for <strong>&quot;Web MIDI Browser&quot;</strong> in the App Store.
                     </div>
                 </div>
             </DialogContent>
        </Dialog>
       )
    }

    return (
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground opacity-50 cursor-not-allowed" title="Web MIDI API not supported">
            <Cable className="h-4 w-4" />
            <span className="hidden sm:inline">MIDI Not Supported</span>
        </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${
            isConnected ? 'text-green-600' : 'text-muted-foreground'
          }`}>
          {isConnected ? (
            <PlugZap className="h-4 w-4" />
          ) : (
            <Cable className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isConnected ? 'MIDI Connected' : 'Connect MIDI'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MIDI Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Device</label>
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No MIDI devices found. Please connect your drum kit and refresh.
              </p>
            ) : (
              <Select
                value={selectedDeviceId || ''}
                onValueChange={onSelectDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name} {device.manufacturer ? `(${device.manufacturer})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              Connect your Roland TD-17 (or other MIDI drums) via USB to play
              along. The game will visualize your hits on the chart.
            </p>
            {isIOS && (
                <p className="text-orange-500">
                    <strong>Note for iPad users:</strong> ensure you are using a Web MIDI compatible browser app.
                </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
