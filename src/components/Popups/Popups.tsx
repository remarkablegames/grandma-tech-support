import { POPUP_CONFIGS } from 'src/data/gameContent';
import { audio } from 'src/services/audio';
import type {
  OpenPopup,
  PopupButtonConfig,
  PopupId,
  WindowId,
} from 'src/types/game';

import { Popup } from '../Popup';

interface PopupsProps {
  windowId: WindowId;
  popups: OpenPopup[];
  onDismiss: (key: string, popupId: PopupId) => void;
  onAction: (windowId: WindowId, button: PopupButtonConfig) => void;
}

export function Popups({ windowId, popups, onDismiss, onAction }: PopupsProps) {
  const ownPopups = popups.filter((popup) => popup.windowId === windowId);

  if (ownPopups.length === 0) {
    return null;
  }

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 z-20 bg-black/25" />
      {ownPopups.map((popup, index) => (
        <Popup
          key={popup.key}
          offset={index}
          config={POPUP_CONFIGS[popup.popupId]}
          onDismiss={() => {
            onDismiss(popup.key, popup.popupId);
          }}
          onAction={(button) => {
            audio.play(button.spawns ? 'open' : 'error');
            onAction(windowId, button);
          }}
        />
      ))}
    </>
  );
}
