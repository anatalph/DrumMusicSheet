import { PracticeModeConfig } from '@/lib/preview/audioManager';
import { parseChartFile } from '@eliwhite/scan-chart';
import {
    createRef,
    forwardRef,
    RefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import convertToVexFlow from './convertToVexflow';
import { Playhead } from './Playhead';
import {
    createConsolidatedTimePositionMap,
    RenderData,
    renderMusic,
} from './renderVexflow';

import { MidiMessage } from '@/lib/hooks/useMidiInput';
import { getDrumInstrumentFromMidi } from '@/lib/midi-mapping';
import { cn } from '@/lib/utils';
import debounce from 'debounce';
import cleanLyrics from './cleanLyrics';

type ParsedChart = ReturnType<typeof parseChartFile>;

export default function SheetMusic({
  chart,
  track,
  currentTime,
  showBarNumbers,
  enableColors,
  showLyrics,
  zoom,
  onSelectMeasure,
  triggerRerender,
  practiceModeConfig,
  onPracticeMeasureSelect,
  selectionIndex,
  audioManagerRef,
  lastMidiNote,
}: {
  chart: ParsedChart;
  track: ParsedChart['trackData'][0];
  currentTime: number;
  showBarNumbers: boolean;
  enableColors: boolean;
  showLyrics: boolean;
  zoom: number;
  onSelectMeasure: (time: number) => void;
  triggerRerender: string;
  practiceModeConfig: PracticeModeConfig | null;
  onPracticeMeasureSelect: (measureIndex: number) => void;
  selectionIndex: number | null;
  audioManagerRef: RefObject<any>;
  lastMidiNote?: MidiMessage | null;
}) {
  const vexflowContainerRef = useRef<HTMLDivElement>(null!);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const highlightsRef = useRef<RefObject<HTMLButtonElement>[]>([]);
  const [highlightedMeasureIndex, setHighlightedMeasureIndex] =
    useState<number>(1);

  const measures = useMemo(() => {
    return convertToVexFlow(chart, track);
  }, [chart, track]);

  const [renderData, setRenderData] = useState<RenderData[]>([]);

  // Visual feedback state
  const [activeHits, setActiveHits] = useState<{id: number; instrument: string; x: number; y: number}[]>([]);

  useEffect(() => {
    if (!lastMidiNote) return;

    const instrument = getDrumInstrumentFromMidi(lastMidiNote.note);
    if (!instrument) return;

    // Approximate mapping for visualization (0 is top, 100 is bottom)
    // Kick: Bottom (100)
    // Snare: Middle-Low (70)
    // Toms: Middle (50)
    // HiHat: Top-Middle (30)
    // Cymbals: Top (10)
    let yPercent = 50;
    switch(instrument) {
        case 'kick': yPercent = 90; break;
        case 'snare': yPercent = 60; break;
        case 'floor-tom': yPercent = 70; break;
        case 'mid-tom': yPercent = 50; break;
        case 'high-tom': yPercent = 40; break;
        case 'hihat': yPercent = 30; break;
        case 'crash': yPercent = 10; break;
        case 'ride': yPercent = 10; break;
    }

    const newHit = {
        id: Date.now(),
        instrument,
        x: 50, // Center horizontally for now, or maybe map to time?
        y: yPercent
    };

    setActiveHits(prev => [...prev, newHit]);

    // Remove hit after animation
    setTimeout(() => {
        setActiveHits(prev => prev.filter(h => h.id !== newHit.id));
    }, 200);

  }, [lastMidiNote]);

  // Create consolidated time->position map for the playhead
  const consolidatedTimeMap = useMemo(() => {
    if (renderData.length === 0) return [];
    return createConsolidatedTimePositionMap(renderData);
  }, [renderData]);

  const debouncedOnResize = useMemo(
    () =>
      debounce(() => {
        const width =
          vexflowContainerRef.current?.offsetWidth ?? window.innerWidth;
        setWindowWidth(width);
      }, 50),
    [],
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedOnResize);
    return () => {
      window.removeEventListener('resize', debouncedOnResize);
    };
  }, [debouncedOnResize]);

  useEffect(() => {
    if (!vexflowContainerRef.current) {
      return;
    }

    // Use this to force the sheet music to re-render when the window width changes
    windowWidth;

    if (vexflowContainerRef.current?.children.length > 0) {
      vexflowContainerRef.current.removeChild(
        vexflowContainerRef.current.children[0],
      );
    }

    const data = renderMusic(
      vexflowContainerRef,
      measures,
      chart.sections,
      // https://github.com/YARC-Official/YARG.Core/blob/6b24334cb6b3588d290e1d5f8231ce70314d097c/YARG.Core/MoonscraperChartParser/IO/Midi/MidReader.cs#L299
      zoom,
      showLyrics
        ? (chart as any).lyrics
            ?.filter((lyric: any) => !lyric.text.includes('['))
            .map((lyric: any) => {
              return {
                ...lyric,
                text: cleanLyrics(lyric.text),
              }; //,
            }) || []
        : [],
      showBarNumbers,
      enableColors,
      practiceModeConfig,
    );
    setRenderData(data);

    highlightsRef.current = data.map(() =>
      createRef(),
    ) as RefObject<HTMLButtonElement>[];
  }, [
    measures,
    showBarNumbers,
    enableColors,
    windowWidth,
    triggerRerender,
    showLyrics,
    (chart as any).lyrics,
    chart.sections,
    practiceModeConfig,
    zoom,
  ]);

  // Remove automatic highlighting of the currently playing measure and auto-scroll
  // Keeping measure overlay divs clickable only

  const measureHighlights = renderData.map(({measure, stave}, index) => {
    // Determine if this measure is in practice mode range
    let isInPracticeRange = false;
    let isPracticeStart = false;
    let isPracticeEnd = false;

    if (practiceModeConfig) {
      isInPracticeRange =
        measure.startMs >= practiceModeConfig.startTimeMs &&
        measure.endMs <= practiceModeConfig.endTimeMs;
      isPracticeStart =
        Math.abs(measure.startMs - practiceModeConfig.startMeasureMs) < 100; // Within 100ms
      isPracticeEnd =
        (selectionIndex == null || selectionIndex === -1) &&
        Math.abs(measure.endMs - practiceModeConfig.endMeasureMs) < 100; // Within 100ms
    }

    return (
      <MeasureHighlight
        key={index}
        ref={highlightsRef.current[index]}
        style={{
          top: stave.getY() * zoom + 10,
          left: stave.getX() * zoom - 5,
          width: stave.getWidth() * zoom + 10,
          height: stave.getHeight() * zoom,
        }}
        isInPracticeRange={isInPracticeRange}
        isPracticeStart={isPracticeStart}
        isPracticeEnd={isPracticeEnd}
        isPracticeModeActive={
          practiceModeConfig !== null && practiceModeConfig.endMeasureMs > 0
        }
        onClick={() => {
          if (selectionIndex !== null) {
            onPracticeMeasureSelect(index);
            return;
          }
          // Normal mode - start playing at the measure
          onSelectMeasure(measure.startMs / 1000);
        }}
      />
    );
  });

  return (
    <div className="flex-1 flex justify-center bg-white rounded-lg border md:overflow-y-auto overflow-x-hidden px-4">
      <div className="relative w-full">
        <div ref={vexflowContainerRef} className="flex h-full w-full" />
        {/* Playhead overlay */}
        {consolidatedTimeMap.length > 0 && (
          <Playhead
            timePositionMap={consolidatedTimeMap}
            audioManagerRef={audioManagerRef}
            zoom={zoom}
          />
        )}
        {measureHighlights}

        {/* MIDI Hit Overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {activeHits.map(hit => (
                <div
                    key={hit.id}
                    className="absolute w-full h-8 bg-blue-500/30 animate-pulse transition-opacity"
                    style={{
                        top: `${hit.y}%`,
                        opacity: 0.5,
                        boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.5)'
                    }}
                />
            ))}
        </div>
      </div>
    </div>
  );
}

interface MeasureHighlightProps {
  style?: React.CSSProperties;
  isInPracticeRange?: boolean;
  isPracticeStart?: boolean;
  isPracticeEnd?: boolean;
  isPracticeModeActive?: boolean;
  onClick?: () => void;
}

const MeasureHighlight = forwardRef<HTMLButtonElement, MeasureHighlightProps>(
  (
    {
      style,
      isInPracticeRange,
      isPracticeStart,
      isPracticeEnd,
      isPracticeModeActive,
      onClick,
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'absolute z-[1] rounded-md border-0 bg-transparent cursor-pointer transition-all duration-200',
          'hover:bg-primary/10',
          isPracticeStart && 'border-l-4 border-green-500',
          isPracticeEnd && 'border-r-4 border-green-500',
        )}
        style={style}
        onClick={onClick}
      />
    );
  },
);

MeasureHighlight.displayName = 'MeasureHighlight';
