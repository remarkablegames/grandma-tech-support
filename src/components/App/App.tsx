import { useEffect } from 'react';
import {
  DESKTOP_ICONS,
  ICON_WINDOWS,
  OBJECTIVES,
  START_ITEMS,
  WINDOW_META,
} from 'src/data/gameContent';
import { useGame } from 'src/hooks/useGame';
import { audio } from 'src/services/audio';
import type { IconTaskbarItem } from 'src/types/game';

import { BrowserWindow } from '../BrowserWindow';
import { DesktopIcon } from '../DesktopIcon';
import { GrandmaSpeech } from '../GrandmaSpeech';
import { IconWindow } from '../IconWindow';
import { InboxWindow } from '../InboxWindow';
import { MessageDialog } from '../MessageDialog';
import { Popups } from '../Popups';
import { ShoppingWindow } from '../ShoppingWindow';
import { StartMenu } from '../StartMenu';
import { Taskbar } from '../Taskbar';
import { VirusWindow } from '../VirusWindow';
import { WinScreen } from '../WinScreen';

export function App() {
  const game = useGame();

  // The current mission: its instruction is grandma's line, and its title,
  // message, and icon dress the task-complete dialog.
  const objective = OBJECTIVES[game.objectiveIndex];
  const isFinalTask = game.phase === 'won';

  // Open icon windows in raise order, so the active one sits rightmost,
  // closest to the tray — Win95 taskbar style.
  const iconTaskbarItems: IconTaskbarItem[] = ICON_WINDOWS.filter(
    (config) => game.openIconWindows[config.id],
  )
    .sort(
      (a, b) => game.iconZOrder.indexOf(a.id) - game.iconZOrder.indexOf(b.id),
    )
    .map((config) => ({
      id: config.id,
      title: config.title,
      icon: config.icon,
    }));

  useEffect(() => {
    audio.startMusic();

    const startOnGesture = () => {
      audio.startMusic();
      document.removeEventListener('pointerdown', startOnGesture);
      document.removeEventListener('keydown', startOnGesture);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        audio.pauseMusic();
      } else {
        audio.startMusic();
      }
    };

    document.addEventListener('pointerdown', startOnGesture);
    document.addEventListener('keydown', startOnGesture);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('pointerdown', startOnGesture);
      document.removeEventListener('keydown', startOnGesture);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="bg-win-desktop relative h-dvh w-full overflow-hidden select-none">
      <div className="absolute top-2 left-2 z-[5] flex flex-col gap-1">
        {DESKTOP_ICONS.map((icon) => {
          const windowId = icon.windowId;

          return (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              selected={game.selectedIcon === icon.id}
              onSelect={game.selectIcon}
              onOpen={
                windowId === undefined
                  ? undefined
                  : () => {
                      game.openIconWindow(windowId);
                    }
              }
            />
          );
        })}
      </div>

      {WINDOW_META.filter((meta) => !game.minimized[meta.id]).map((meta) => (
        <BrowserWindow
          key={meta.id}
          windowId={meta.id}
          title={meta.title}
          icon={meta.icon}
          url={meta.url}
          position={game.positions[meta.id]}
          isFront={game.focusedId === meta.id}
          maximized={game.maximized[meta.id]}
          zIndex={10 + game.zOrder.indexOf(meta.id)}
          onFocus={game.raise}
          onMove={game.moveWindow}
          onMinimize={game.minimize}
          onToggleMaximize={game.toggleMaximize}
          onJoke={game.showJoke}
        >
          {meta.id === 'shopping' && <ShoppingWindow onBuy={game.buyToaster} />}
          {meta.id === 'inbox' && (
            <InboxWindow
              loggedIn={game.loggedIn}
              onLogin={game.login}
              onJoke={game.showJoke}
              onOpenEmail={game.openEmail}
            />
          )}
          {meta.id === 'virus' && <VirusWindow onJoke={game.showJoke} />}
          <Popups
            windowId={meta.id}
            popups={game.openPopups}
            onDismiss={game.dismissPopup}
            onAction={game.popupAction}
          />
        </BrowserWindow>
      ))}

      {ICON_WINDOWS.filter(
        (config) =>
          game.openIconWindows[config.id] && !game.iconMinimized[config.id],
      ).map((config) => (
        <IconWindow
          key={config.id}
          config={config}
          position={game.iconWindowPositions[config.id]}
          zIndex={15 + game.iconZOrder.indexOf(config.id)}
          onFocus={() => {
            game.raiseIconWindow(config.id);
          }}
          onMove={(position) => {
            game.moveIconWindow(config.id, position);
          }}
          onMinimize={() => {
            game.minimizeIconWindow(config.id);
          }}
          onClose={() => {
            game.closeIconWindow(config.id);
          }}
          onOpenWindow={game.openIconWindow}
          onScanComplete={game.completeScan}
        />
      ))}

      <GrandmaSpeech line={game.grandmaLine} />

      <Taskbar
        windows={WINDOW_META}
        iconWindows={iconTaskbarItems}
        focusedId={game.focusedId}
        focusedIconId={game.iconFocusedId}
        startOpen={game.startOpen}
        onStartToggle={game.toggleStart}
        onWindowClick={game.activateWindow}
        onIconWindowClick={game.activateIconWindow}
      />

      {game.startOpen && (
        <StartMenu items={START_ITEMS} onSelect={game.selectStartItem} />
      )}

      {game.message !== null && (
        <MessageDialog message={game.message} onDismiss={game.dismissJoke} />
      )}

      {game.phase !== 'playing' && (
        <WinScreen
          title={objective.doneTitle}
          message={objective.doneMessage}
          icon={objective.icon}
          buttonLabel={isFinalTask ? 'Play again' : 'Next task'}
          onConfirm={isFinalTask ? game.playAgain : game.nextObjective}
        />
      )}
    </div>
  );
}
