import { useState } from 'react';
import { audio } from 'src/services/audio';
import type { WindowId, WindowMeta } from 'src/types/game';

interface TaskManagerProps {
  windows: WindowMeta[];
  frozen: Record<WindowId, boolean>;
  onEndTask: (windowId: WindowId) => void;
  onShutDown: () => void;
  onCancel: () => void;
}

// The NT-era Task Manager: Win95's Close Program list under its better-known
// name, with the same End Task / Shut Down / Cancel row. Reached from
// Start > Task Manager, because browsers on Windows can never hear the real
// Ctrl+Alt+Del chord — the mission teaches only this mouse route.
export function TaskManager({
  windows,
  frozen,
  onEndTask,
  onShutDown,
  onCancel,
}: TaskManagerProps) {
  const [selected, setSelected] = useState<WindowId | null>(null);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task Manager"
        className="animate-dialog bg-win-face win-outset w-full max-w-sm p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          Task Manager
        </div>

        <div className="win-inset mx-3 mt-3 h-32 overflow-auto bg-white py-1">
          {windows.map((meta) => {
            const title = frozen[meta.id]
              ? `${meta.title} (Not responding)`
              : meta.title;
            const isSelected = selected === meta.id;

            return (
              <button
                key={meta.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  audio.play('click');
                  setSelected(meta.id);
                }}
                className={`block w-full px-1.5 py-0.5 text-left text-sm ${
                  isSelected ? 'bg-win-navy text-white' : 'text-black'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 p-4">
          <button
            type="button"
            autoFocus
            disabled={selected === null}
            onClick={
              selected === null
                ? undefined
                : () => {
                    audio.play('click');
                    onEndTask(selected);
                  }
            }
            className="win-button disabled:text-win-shadow min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            End Task
          </button>
          <button
            type="button"
            onClick={() => {
              audio.play('click');
              onShutDown();
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            Shut Down
          </button>
          <button
            type="button"
            onClick={() => {
              audio.play('click');
              onCancel();
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
