import { useEffect } from 'react';
import { audio } from 'src/services/audio';
import type { MessageVariant } from 'src/types/game';

// Win95's message-box icons: a red X for errors, a smile for grandma's gags,
// and the blue Information "i" when the dialog is just telling you the task.
const MESSAGE_FACES: Record<MessageVariant, string> = {
  error: '❌',
  joke: '😅',
  info: 'ℹ️',
};

interface MessageDialogProps {
  message: string;
  variant?: MessageVariant;
  onDismiss: () => void;
}

export function MessageDialog({
  message,
  variant = 'joke',
  onDismiss,
}: MessageDialogProps) {
  useEffect(() => {
    if (variant === 'error') {
      audio.play('error');
    }
  }, [variant]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="System Message"
        className="animate-dialog bg-win-face win-outset w-full max-w-sm p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          System Message
        </div>

        <div className="flex items-start gap-3 p-4">
          <span aria-hidden="true" className="text-3xl">
            {MESSAGE_FACES[variant]}
          </span>
          <p className="text-sm leading-snug text-black">{message}</p>
        </div>

        <div className="flex justify-center pb-4">
          <button
            type="button"
            autoFocus
            onClick={() => {
              audio.play('click');
              onDismiss();
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
