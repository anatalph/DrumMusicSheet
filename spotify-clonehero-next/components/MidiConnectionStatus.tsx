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
  if (!isSupported) return null;

  const isConnected = selectedDeviceId !== null;

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

          <div className="text-xs text-muted-foreground">
            <p>
              Connect your Roland TD-17 (or other MIDI drums) via USB to play
              along. The game will visualize your hits on the chart.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
