import { type MouseEvent, useEffect, useState } from 'react';
import {
  DESKTOP_CONTEXT_MENU,
  DESKTOP_ICONS,
  ICON_CONTEXT_MENU,
  ICON_WINDOWS,
  OBJECTIVES,
  RECYCLE_BIN_ICONS,
  rowContextMenu,
  START_ITEMS,
  WINDOW_META,
} from 'src/data/gameContent';
import { useGame } from 'src/hooks/useGame';
import { useIconPositions } from 'src/hooks/useIconPositions';
import { audio } from 'src/services/audio';
import type {
  ContextMenuItem,
  ContextMenuJokeItem,
  ContextMenuOpenItem,
  DesktopIconConfig,
  IconTaskbarItem,
  IconWindowId,
  IconWindowRow,
  StartMenuDesktopItem,
  StartMenuItem,
} from 'src/types/game';
import { resolveIconDrop } from 'src/utils/resolveIconDrop';

import { BrowserWindow } from '../BrowserWindow';
import { ContextMenu } from '../ContextMenu';
import { DesktopIcon } from '../DesktopIcon';
import { GrandmaSpeech } from '../GrandmaSpeech';
import { IconWindow } from '../IconWindow';
import { InboxWindow } from '../InboxWindow';
import { MessageDialog } from '../MessageDialog';
import { Popups } from '../Popups';
import { PowerScreen } from '../PowerScreen';
import { ShoppingWindow } from '../ShoppingWindow';
import { ShutdownDialog } from '../ShutdownDialog';
import { StartMenu } from '../StartMenu';
import { Taskbar } from '../Taskbar';
import { TaskManager } from '../TaskManager';
import { UpdateDialog } from '../UpdateDialog';
import { VirusWindow } from '../VirusWindow';
import { WinScreen } from '../WinScreen';

// A context menu waiting on screen: where it opens, what it offers, and
// (for icons) what a "double-click" entry should actually do.
interface OpenContextMenu {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onOpen?: () => void;
}

const ICON_BY_ID = new Map(DESKTOP_ICONS.map((icon) => [icon.id, icon]));

// Stored ids the current desktop still knows, in the order they were
// consumed.
const knownIcons = (ids: string[]) =>
  ids
    .map((id) => ICON_BY_ID.get(id))
    .filter((icon): icon is DesktopIconConfig => icon !== undefined);

// Win95's folder actions: the bin restores what it ate, My Documents
// hands back what was filed into it.
const RESTORE_LABELS: Partial<Record<IconWindowId, string>> = {
  recycle: 'Restore',
  documents: 'Take back',
};

export function App() {
  const game = useGame();
  const iconPositions = useIconPositions();

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

  // Closed browser windows show up nowhere: no frame, no taskbar button.
  const openWindows = WINDOW_META.filter((meta) => game.open[meta.id]);

  const [contextMenu, setContextMenu] = useState<OpenContextMenu | null>(null);

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Recycled and filed icons leave the desktop but never the game: the
  // bin and the folder list them instead.
  const concealed = new Set([
    ...iconPositions.recycled,
    ...iconPositions.filed,
  ]);

  // What a list window shows of that: the bin's recent victims first
  // (newest on top, Win95 style), the folder's new arrivals appended.
  const dynamicRows = (windowId: IconWindowId): IconWindowRow[] => {
    if (windowId === 'recycle') {
      return knownIcons(iconPositions.recycled).map((icon) => ({
        icon: icon.icon,
        label: icon.label,
        desktopId: icon.id,
      }));
    }

    if (windowId === 'documents') {
      return knownIcons(iconPositions.filed).map((icon) => ({
        icon: icon.icon,
        label: icon.label,
        desktopId: icon.id,
        hint: 'shortcut',
      }));
    }

    return [];
  };

  // A right-clicked row's Open entry runs the row's own double-click path.
  const openRowAction = (row: IconWindowRow): (() => void) | undefined => {
    const opens = row.opens;
    if (opens !== undefined) {
      return () => {
        game.openIconWindow(opens);
      };
    }

    const desktopId = row.desktopId;
    if (desktopId !== undefined) {
      return () => {
        game.openDesktopIcon(desktopId);
      };
    }

    return undefined;
  };

  // Filed shortcuts mirror into Start > Documents, next to the real
  // folder's own contents.
  const filedMenuItems: StartMenuDesktopItem[] = knownIcons(
    iconPositions.filed,
  ).map((icon) => ({
    id: `filed-${icon.id}`,
    label: icon.label,
    icon: icon.icon,
    desktopId: icon.id,
  }));

  const startItems = START_ITEMS.map((item): StartMenuItem =>
    item.id === 'documents' && 'children' in item
      ? { ...item, children: [...item.children, ...filedMenuItems] }
      : item,
  );

  // Win95 swaps menus: opening one puts the Start menu away.
  const openContextMenu = (menu: OpenContextMenu) => {
    if (game.startOpen) {
      game.toggleStart();
    }

    setContextMenu(menu);
  };

  const handleRootContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    // The browser's own menu never appears; only the bare desktop earns
    // Win95's menu (windows and the taskbar just swallow the click).
    event.preventDefault();

    if (event.target === event.currentTarget) {
      openContextMenu({
        x: event.clientX,
        y: event.clientY,
        items: DESKTOP_CONTEXT_MENU,
      });
    }
  };

  const handleContextMenuSelect = (
    item: ContextMenuJokeItem | ContextMenuOpenItem,
  ) => {
    setContextMenu(null);

    if ('action' in item) {
      contextMenu?.onOpen?.();
      return;
    }

    game.showJoke(item.message);
  };

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
    <div
      className="bg-win-desktop relative h-dvh w-full overflow-hidden select-none"
      onContextMenu={handleRootContextMenu}
    >
      {game.powerScreen !== 'splash' && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[5]">
            {DESKTOP_ICONS.filter((icon) => !concealed.has(icon.id)).map(
              (icon) => {
                // Win95 fills the bin the moment anything lands in it.
                const binFull =
                  icon.id === 'recycle' && iconPositions.recycled.length > 0;

                return (
                  <DesktopIcon
                    key={icon.id}
                    icon={
                      binFull ? { ...icon, icon: RECYCLE_BIN_ICONS.full } : icon
                    }
                    position={iconPositions.positions[icon.id]}
                    selected={game.selectedIcon === icon.id}
                    onSelect={game.selectIcon}
                    onMove={(cell) => {
                      const drop = resolveIconDrop(
                        icon,
                        cell,
                        iconPositions.positions,
                        DESKTOP_ICONS,
                      );

                      if (drop === 'refuse') {
                        audio.play('error');
                        return;
                      }

                      if (drop === 'recycle') {
                        iconPositions.recycleIcon(icon.id);
                        return;
                      }

                      if (drop === 'file') {
                        iconPositions.fileIcon(icon.id);
                        return;
                      }

                      iconPositions.moveIcon(icon.id, cell);
                    }}
                    onOpen={() => {
                      game.openDesktopIcon(icon.id);
                    }}
                    onContextMenu={(x, y) => {
                      openContextMenu({
                        x,
                        y,
                        items: ICON_CONTEXT_MENU,
                        onOpen: () => {
                          game.openDesktopIcon(icon.id);
                        },
                      });
                    }}
                  />
                );
              },
            )}
          </div>

          {openWindows
            .filter((meta) => !game.minimized[meta.id])
            .map((meta) => (
              <BrowserWindow
                key={meta.id}
                windowId={meta.id}
                title={meta.title}
                icon={meta.icon}
                url={meta.url}
                position={game.positions[meta.id]}
                isFront={game.focusedId === meta.id}
                maximized={game.maximized[meta.id]}
                frozen={game.frozen[meta.id]}
                zIndex={10 + game.zOrder.indexOf(meta.id)}
                onFocus={game.raise}
                onMove={game.moveWindow}
                onMinimize={game.minimize}
                onToggleMaximize={game.toggleMaximize}
                onClose={game.closeWindow}
                onJoke={game.showJoke}
                onFrozenClick={game.reactFrozen}
              >
                {meta.id === 'shopping' && (
                  <ShoppingWindow onBuy={game.buyToaster} />
                )}
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
              config={
                config.kind === 'list'
                  ? {
                      ...config,
                      rows: [...dynamicRows(config.id), ...config.rows],
                    }
                  : config
              }
              position={game.iconWindowPositions[config.id]}
              zIndex={15 + game.iconZOrder.indexOf(config.id)}
              restoreLabel={RESTORE_LABELS[config.id]}
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
              onOpenDesktop={game.openDesktopIcon}
              onRestoreDesktop={iconPositions.restoreIcon}
              onScanComplete={game.completeScan}
              onContextMenu={
                // Win95's folder menus nearly mirror the desktop's, so the list
                // body shares it; a right-clicked row gets the file menu instead.
                config.kind === 'list'
                  ? (x, y, row) => {
                      if (row === undefined) {
                        openContextMenu({ x, y, items: DESKTOP_CONTEXT_MENU });
                        return;
                      }

                      openContextMenu({
                        x,
                        y,
                        items: rowContextMenu(row),
                        onOpen: openRowAction(row),
                      });
                    }
                  : undefined
              }
            />
          ))}

          <GrandmaSpeech
            line={game.grandmaLine}
            onRepeat={game.repeatObjective}
          />

          <Taskbar
            windows={openWindows}
            iconWindows={iconTaskbarItems}
            focusedId={game.focusedId}
            focusedIconId={game.iconFocusedId}
            frozen={game.frozen}
            startOpen={game.startOpen}
            onStartToggle={game.toggleStart}
            onWindowClick={game.activateWindow}
            onIconWindowClick={game.activateIconWindow}
          />

          {game.startOpen && (
            <StartMenu
              items={startItems}
              onSelect={game.selectStartItem}
              onDismiss={game.toggleStart}
            />
          )}

          {contextMenu !== null && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              items={contextMenu.items}
              onSelect={handleContextMenuSelect}
              onDismiss={closeContextMenu}
            />
          )}

          {game.updateStage !== null && (
            <UpdateDialog
              stage={game.updateStage}
              onAdvance={game.advanceUpdate}
              onLater={game.laterUpdate}
              onRestart={game.rebootUpdate}
            />
          )}

          {game.taskManagerOpen && (
            <TaskManager
              windows={openWindows}
              frozen={game.frozen}
              onEndTask={game.endTask}
              onShutDown={game.shutDownFromTaskManager}
              onCancel={game.closeTaskManager}
            />
          )}

          {game.message !== null && (
            <MessageDialog
              message={game.message}
              variant={game.messageVariant}
              onDismiss={game.dismissJoke}
            />
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
        </>
      )}

      {game.shutdownOpen && (
        <ShutdownDialog
          onConfirm={game.confirmShutdown}
          onCancel={game.closeShutdown}
        />
      )}

      {/* Above every dialog: the power screens own the whole desktop. */}
      {game.powerScreen !== null && (
        <PowerScreen mode={game.powerScreen} onLeave={game.leavePowerScreen} />
      )}
    </div>
  );
}
