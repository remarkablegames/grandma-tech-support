import type { PopupButtonConfig, PopupConfig } from 'src/types/game';

interface PopupProps {
  config: PopupConfig;
  offset: number;
  onDismiss: () => void;
  onAction: (button: PopupButtonConfig) => void;
}

export function Popup({ config, offset, onDismiss, onAction }: PopupProps) {
  return (
    <div
      role="dialog"
      aria-label={config.title}
      className="animate-popup bg-win-face win-outset absolute z-30 max-w-[320px] p-[3px] drop-shadow-[3px_3px_0_rgba(0,0,0,0.4)]"
      style={{ left: 12 + offset * 16, top: 14 + offset * 16, right: 12 }}
    >
      <div className="win-titlebar flex items-center justify-between gap-2 px-1 py-0.5">
        <span className="truncate text-[11px] font-bold text-white">
          {config.title}
        </span>
        <button
          type="button"
          aria-label="Close popup"
          onClick={onDismiss}
          className="win-button h-4 w-5 shrink-0 text-[9px] leading-none"
        >
          ✕
        </button>
      </div>

      <div className="flex items-start gap-2 p-3">
        <img
          src={config.icon}
          alt=""
          width={32}
          height={32}
          draggable={false}
          className="pixelated size-8 shrink-0"
        />
        <p className="text-xs leading-snug text-black">{config.message}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pb-3">
        {config.buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => {
              onAction(button);
            }}
            className="win-button min-w-20 px-3 py-1.5 text-xs font-bold text-black"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
