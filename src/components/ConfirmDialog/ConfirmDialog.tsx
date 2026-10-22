import { audio } from 'src/services/audio';

interface ConfirmDialogProps {
  title: string;
  message: string;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Win95's two-button message box: the confirm flavour of System Message,
// asking the real question (emptying the bin, for now) with an autofocused
// Yes beside a No. Either button just closes it and hands back to the flow
// that asked.
export function ConfirmDialog({
  title,
  message,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="animate-dialog bg-win-face win-outset w-full max-w-sm p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          {title}
        </div>

        <div className="flex items-start gap-3 p-4">
          {icon !== undefined && (
            <img
              src={icon}
              alt=""
              width={32}
              height={32}
              draggable={false}
              className="pixelated size-8 shrink-0"
            />
          )}
          <p className="text-sm leading-snug text-black">{message}</p>
        </div>

        <div className="flex justify-center gap-2 pb-4">
          <button
            type="button"
            autoFocus
            onClick={() => {
              audio.play('click');
              onConfirm();
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              audio.play('click');
              onCancel();
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
