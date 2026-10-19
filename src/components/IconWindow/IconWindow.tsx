import { useEffect, useState } from 'react';
import { useDoubleClickOpen } from 'src/hooks/useDoubleClickOpen';
import { audio } from 'src/services/audio';
import type {
  IconWindowConfig,
  IconWindowId,
  IconWindowRow,
  ListIconWindow,
  WindowPosition,
} from 'src/types/game';
import { createWindowDrag } from 'src/utils/createWindowDrag';

const CALCULATOR_KEYS = [
  '7',
  '8',
  '9',
  'C',
  '4',
  '5',
  '6',
  '÷',
  '1',
  '2',
  '3',
  '×',
  '0',
  '.',
  '=',
  '+',
];

const CALCULATOR_LIMIT = '47';

const SCAN_MS = 600;

// Grandma's calculator accepts digits just fine, but every sum ends the same way.
function Calculator() {
  const [display, setDisplay] = useState('0');

  const pressKey = (key: string) => {
    if (key === 'C') {
      setDisplay('0');
      return;
    }

    if (key === '=') {
      setDisplay(CALCULATOR_LIMIT);
      return;
    }

    setDisplay((prev) => (prev === '0' ? '' : prev).concat(key).slice(0, 9));
  };

  return (
    <div className="p-1">
      <div
        role="status"
        aria-label="Calculator display"
        className="win-inset mb-1.5 bg-white px-1.5 py-1 text-right font-mono text-sm text-black"
      >
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {CALCULATOR_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              pressKey(key);
            }}
            className="win-button px-1 py-1 text-xs text-black"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

type ScanPhase = 'idle' | 'scanning' | 'done';

// Grandma's shield program: one scan, one sweep of whatever is popping
// over the windows. The result is always the same suspect.
function Scanner({ onScanComplete }: { onScanComplete: () => void }) {
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');

  useEffect(() => {
    if (scanPhase !== 'scanning') {
      return;
    }

    const timer = setTimeout(() => {
      setScanPhase('done');
    }, SCAN_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [scanPhase]);

  // Announce through game state only after the sweep settles; the handler
  // is idempotent, so re-renders during "done" can't double-complete.
  useEffect(() => {
    if (scanPhase === 'done') {
      onScanComplete();
    }
  }, [onScanComplete, scanPhase]);

  return (
    <div className="p-2 text-xs text-black">
      <div
        aria-live="polite"
        className="win-inset mb-2 flex h-14 flex-col justify-center bg-white px-2"
      >
        {scanPhase === 'idle' && <p>Ready to scan C:\</p>}
        {scanPhase === 'scanning' && (
          <p className="animate-blink font-bold">Scanning C:\ ...</p>
        )}
        {scanPhase === 'done' && (
          <p className="font-bold">
            1 threat quarantined: toaster_7_install.exe
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={scanPhase === 'scanning'}
        onClick={() => {
          setScanPhase('scanning');
        }}
        className="win-button disabled:text-win-shadow w-full px-2 py-1.5 font-bold text-black"
      >
        {scanPhase === 'done' ? 'Scan again' : 'Scan'}
      </button>
    </div>
  );
}

// Rows with an `opens` target behave like Windows Explorer files: quick
// double-click (or Enter) opens the referenced window.
function IconRow({
  row,
  selected,
  onSelect,
  onOpenWindow,
}: {
  row: IconWindowRow;
  selected: boolean;
  onSelect: () => void;
  onOpenWindow: (windowId: IconWindowId) => void;
}) {
  const opens = row.opens;
  const handleOpen = useDoubleClickOpen(
    opens === undefined
      ? undefined
      : () => {
          onOpenWindow(opens);
        },
  );

  const content = (
    <>
      {row.icon !== undefined && (
        <img
          src={row.icon}
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="pixelated size-4 shrink-0"
        />
      )}
      <span className="truncate">{row.label}</span>
      {row.hint !== undefined && (
        <span
          className={`ml-auto shrink-0 pl-2 text-[10px] ${
            selected ? 'text-white' : 'text-win-shadow'
          }`}
        >
          {row.hint}
        </span>
      )}
    </>
  );

  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={(event) => {
          onSelect();
          handleOpen(event);
        }}
        className={`flex w-full items-center gap-1.5 px-1 py-0.5 text-left ${
          selected ? 'bg-win-navy text-white' : ''
        }`}
      >
        {content}
      </button>
    </li>
  );
}

// Folder rows highlight on a single click, exactly like desktop icons;
// rows with an `opens` target open on top of that selection.
function IconList({
  config,
  onOpenWindow,
}: {
  config: ListIconWindow;
  onOpenWindow: (windowId: IconWindowId) => void;
}) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  return (
    <ul className="win-inset h-40 overflow-y-auto bg-white p-1 text-xs text-black">
      {config.rows.map((row, index) => (
        <IconRow
          key={`${row.label}-${String(index)}`}
          row={row}
          selected={selectedRow === index}
          onSelect={() => {
            setSelectedRow(index);
          }}
          onOpenWindow={onOpenWindow}
        />
      ))}
    </ul>
  );
}

function IconWindowContent({
  config,
  onOpenWindow,
  onScanComplete,
}: {
  config: IconWindowConfig;
  onOpenWindow: (windowId: IconWindowId) => void;
  onScanComplete: () => void;
}) {
  switch (config.kind) {
    case 'list':
      return <IconList config={config} onOpenWindow={onOpenWindow} />;
    case 'note':
      return (
        <div className="win-inset h-40 bg-white p-2 text-xs text-black">
          {config.lines.map((line) => (
            <p key={line} className="py-0.5 font-bold">
              {line}
            </p>
          ))}
        </div>
      );
    case 'calculator':
      return <Calculator />;
    case 'scanner':
      return <Scanner onScanComplete={onScanComplete} />;
  }
}

interface IconWindowProps {
  config: IconWindowConfig;
  position: WindowPosition;
  zIndex: number;
  onFocus: () => void;
  onMove: (position: WindowPosition) => void;
  onMinimize: () => void;
  onClose: () => void;
  onOpenWindow: (windowId: IconWindowId) => void;
  onScanComplete: () => void;
}

export function IconWindow({
  config,
  position,
  zIndex,
  onFocus,
  onMove,
  onMinimize,
  onClose,
  onOpenWindow,
  onScanComplete,
}: IconWindowProps) {
  const startDrag = createWindowDrag({ position, onMove });

  return (
    <section
      aria-label={config.title}
      className="bg-win-face win-outset absolute w-[min(86vw,260px)] p-[3px]"
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={() => {
        audio.play('click');
        onFocus();
      }}
    >
      <div
        className="win-titlebar flex touch-none items-center gap-1 px-1 py-1"
        onPointerDown={startDrag}
      >
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-white">
          {config.title}
        </span>
        <div className="flex shrink-0 items-center gap-px">
          <button
            type="button"
            aria-label={`Minimize ${config.title}`}
            onClick={onMinimize}
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            –
          </button>
          <button
            type="button"
            aria-label={`Close ${config.title}`}
            onClick={onClose}
            className="win-button h-4 w-5 text-[9px] leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      <IconWindowContent
        config={config}
        onOpenWindow={onOpenWindow}
        onScanComplete={onScanComplete}
      />
    </section>
  );
}
