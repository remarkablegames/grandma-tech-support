import { useState } from 'react';
import { audio } from 'src/services/audio';
import type { IconWindowConfig, WindowPosition } from 'src/types/game';
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

function IconWindowContent({ config }: { config: IconWindowConfig }) {
  switch (config.kind) {
    case 'list':
      return (
        <ul className="win-inset h-40 overflow-y-auto bg-white p-1 text-xs text-black">
          {config.rows.map((row, index) => (
            <li
              key={`${row.label}-${String(index)}`}
              className="flex items-center gap-1.5 px-1 py-0.5"
            >
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
                <span className="text-win-shadow ml-auto shrink-0 pl-2 text-[10px]">
                  {row.hint}
                </span>
              )}
            </li>
          ))}
        </ul>
      );
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
}

export function IconWindow({
  config,
  position,
  zIndex,
  onFocus,
  onMove,
  onMinimize,
  onClose,
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

      <IconWindowContent config={config} />
    </section>
  );
}
