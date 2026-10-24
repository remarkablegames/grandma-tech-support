import { type MouseEvent, useEffect, useState } from 'react';
import {
  CONFIRM_EMPTY_BIN,
  CONFIRM_PURGE_FILE,
  CONFIRM_RECYCLE_FILE,
  DESKTOP_CONTEXT_MENU,
  DESKTOP_ICONS,
  ICON_WINDOWS,
  iconContextMenu,
  inboxTitle,
  OBJECTIVES,
  RECYCLE_BIN_ICONS,
  rowContextMenu,
  START_ITEMS,
  TASK_FILES,
  WINDOW_META,
} from 'src/data/gameContent';
import { useGame } from 'src/hooks/useGame';
import {
  type IconPositions,
  useIconPositions,
} from 'src/hooks/useIconPositions';
import { audio } from 'src/services/audio';
import type {
  ContextMenuDeleteItem,
  ContextMenuEffectItem,
  ContextMenuItem,
  ContextMenuJokeItem,
  ContextMenuOpenItem,
  ContextMenuRestoreItem,
  DesktopIconConfig,
  IconTaskbarItem,
  IconWindowId,
  IconWindowRow,
  ListIconWindow,
  ShutdownMode,
  StartMenuDesktopItem,
  StartMenuItem,
  TaskFileConfig,
} from 'src/types/game';
import { resolveIconDrop } from 'src/utils/resolveIconDrop';

import { BrowserWindow } from '../BrowserWindow';
import { ConfirmDialog } from '../ConfirmDialog';
import { ContextMenu } from '../ContextMenu';
import { DefragDialog } from '../DefragDialog';
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

// A menu's delete waiting on its Win95 confirm: the bin's multi-item
// empty, or one file's trip to the bin (`recycle` — from the desktop or
// a folder) or out of it for real (`purge` — from inside the bin).
// `target` and `icon` dress the dialog with the file's name and face.
type PendingConfirm =
  | { kind: 'empty' }
  | { kind: 'recycle' | 'purge'; id: string; target: string; icon?: string };

const ICON_BY_ID = new Map(
  [...DESKTOP_ICONS, ...TASK_FILES].map((icon) => [icon.id, icon]),
);

// Stored ids the current desktop still knows, in the order they were
// consumed.
const knownIcons = (ids: string[]) =>
  ids
    .map((id) => ICON_BY_ID.get(id))
    .filter((icon): icon is DesktopIconConfig => icon !== undefined);

// The disk-full task's culprits are all out of play once every one of
// them is in the given absent lists (the bin, or emptied for real); with
// no active culprits (every other evening) the answer is no.
const taskFilesGone = (files: TaskFileConfig[], absent: string[]): boolean =>
  files.length > 0 && files.every((file) => absent.includes(file.id));

// Win95's folder action: the windows holding restorable shortcuts (the
// bin, My Documents) all speak its own word for putting one back on the
// desktop.
const RESTORE_LABELS: Partial<Record<IconWindowId, string>> = {
  recycle: 'Restore',
  documents: 'Restore',
};

export function App() {
  const game = useGame();
  const iconPositions = useIconPositions();

  // The current task: its instruction is grandma's line, and its title,
  // message, and icon dress the task-complete dialog.
  const objective = OBJECTIVES[game.objectiveIndex];
  const isFinalTask = game.phase === 'won';

  // The disk-full task's culprits live on the desktop only while it runs,
  // at the cells their configs carry: the persisted layout never learns
  // their ids, so they arrive fresh (and in place) every time.
  const activeFiles: TaskFileConfig[] =
    objective.lowDisk === true ? TASK_FILES : [];
  const desktopIcons: DesktopIconConfig[] = [...DESKTOP_ICONS, ...activeFiles];
  const cells: IconPositions = { ...iconPositions.positions };

  for (const file of activeFiles) {
    cells[file.id] ??= file.home;
  }

  // Win95 greys Empty Recycle Bin until the bin holds anything at all.
  const canEmpty = iconPositions.recycled.length > 0;

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
  // The inbox's title counts its mail live, so the frame and the taskbar
  // button stay in step as junk breeds and gets deleted.
  const openWindows = WINDOW_META.filter((meta) => game.open[meta.id]).map(
    (meta) =>
      meta.id === 'inbox'
        ? { ...meta, title: inboxTitle(game.emails.length) }
        : meta,
  );

  const [contextMenu, setContextMenu] = useState<OpenContextMenu | null>(null);
  // The menu's delete dialog: the ask Win95's Yes/No pair answers, held
  // until the player picks one — or nothing at all.
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Recycled, filed, and emptied icons leave the desktop but never the
  // game: the bin, the folder, and the deleted list remember them instead.
  const concealed = new Set([
    ...iconPositions.recycled,
    ...iconPositions.filed,
    ...iconPositions.deleted,
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

  // What a list window shows of its config: the bin's recent victims first
  // (newest on top, Win95 style), then whatever static rows the window
  // ships — the bin ships none, starting empty like Win95's own.
  const windowRows = (config: ListIconWindow): IconWindowRow[] => [
    ...dynamicRows(config.id),
    ...config.rows,
  ];

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

  // Win95 swaps menus: opening one puts the Start menu away, and every
  // right-click popup answers with Win95's own MenuPopup sound event (the
  // Start menu itself stays quiet — it isn't a right-click menu).
  const openContextMenu = (menu: OpenContextMenu) => {
    if (game.startOpen) {
      game.toggleStart();
    }

    audio.play('menu');
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
    item:
      | ContextMenuJokeItem
      | ContextMenuOpenItem
      | ContextMenuEffectItem
      | ContextMenuRestoreItem
      | ContextMenuDeleteItem,
  ) => {
    setContextMenu(null);

    if ('effect' in item) {
      if (item.effect === 'restore') {
        iconPositions.restoreIcon(item.desktopId);
        return;
      }

      if (item.effect === 'empty-bin') {
        setPendingConfirm({ kind: 'empty' });
        return;
      }

      // Win95's Delete always asks first; the dialog's Yes acts.
      setPendingConfirm({
        kind: item.effect,
        id: item.desktopId,
        target: item.target,
        icon: item.icon,
      });

      return;
    }

    if ('action' in item) {
      contextMenu?.onOpen?.();
      return;
    }

    game.showJoke(item.message);
  };

  // Recycling lands the same from anywhere — a drop on the bin or a
  // menu's Delete: into the bin it goes, then grandma checks whether the
  // culprits are all in there. Emptied ones don't count here — after the
  // real empty, the bin stays quiet.
  const recycleAndNote = (id: string) => {
    iconPositions.recycleIcon(id);

    // Both culprits in the bin: grandma points at the empty step next.
    const binned = [
      id,
      ...iconPositions.recycled.filter((kept) => kept !== id),
    ];

    if (taskFilesGone(activeFiles, binned)) {
      game.noteDiskMilestone('binned');
    }
  };

  // What each confirm asks: Win95's own sentences — the file quoted by
  // name with its face looking on, the full bin for the multi-item empty.
  const confirmFor = (pending: PendingConfirm) => {
    if (pending.kind === 'empty') {
      return {
        title: CONFIRM_EMPTY_BIN.title,
        message: CONFIRM_EMPTY_BIN.message,
        icon: RECYCLE_BIN_ICONS.full,
      };
    }

    const copy =
      pending.kind === 'purge' ? CONFIRM_PURGE_FILE : CONFIRM_RECYCLE_FILE;

    return {
      title: copy.title,
      message: copy.message(pending.target),
      icon: pending.icon,
    };
  };

  // Yes: the asked-for delete happens for real — the wipe, the trip to
  // the bin, or the purge out of it — and the dialog goes away.
  const applyConfirm = (pending: PendingConfirm) => {
    setPendingConfirm(null);

    if (pending.kind === 'recycle') {
      audio.play('drop');
      recycleAndNote(pending.id);
      return;
    }

    if (pending.kind === 'purge') {
      // A purge stays out of grandma's chatter: her freed-disk line
      // belongs to the empty, which anything still in the bin can always
      // play later. This one file just goes for the evening.
      iconPositions.purgeIcon(pending.id);
      audio.play('delete');

      const toasterIds = TASK_FILES.map(({ id }) => id);
      const toastersDeleted = toasterIds.every((id) =>
        iconPositions.deleted.concat(pending.id).includes(id),
      );
      // v8 ignore next
      if (toastersDeleted) {
        game.noteDiskMilestone('emptied');
      }

      return;
    }

    // Emptying the bin only counts as the disk-full task's beat when the
    // culprits were the ones in there: an empty of some other shortcut
    // alone frees no space for grandma to point at. Already-emptied
    // culprits count as gone, so a half-emptied evening still lands the
    // line.
    const filesBinned = taskFilesGone(activeFiles, [
      ...iconPositions.recycled,
      ...iconPositions.deleted,
    ]);

    iconPositions.emptyBin();
    audio.play('delete');

    if (filesBinned) {
      game.noteDiskMilestone('emptied');
    }
  };

  // Play again and the restart behind the boot screens reset the evening —
  // everything emptied for real rides back with it.
  const handlePlayAgain = () => {
    game.playAgain();
    iconPositions.resetBin();
  };

  const handleShutdown = (mode: ShutdownMode) => {
    game.confirmShutdown(mode);

    if (mode === 'restart') {
      iconPositions.resetBin();
    }
  };

  // Win95's icon highlight is focus: press anywhere that isn't an icon
  // and the selected icon lets go. The marker lives on the icon itself,
  // so this fires for desktop, window, taskbar, and menu presses alike.
  useEffect(() => {
    const clearIconSelection = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('[data-desktop-icon]') === null
      ) {
        game.clearSelection();
      }
    };

    document.addEventListener('pointerdown', clearIconSelection);

    return () => {
      document.removeEventListener('pointerdown', clearIconSelection);
    };
  });

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
            {desktopIcons
              .filter((icon) => !concealed.has(icon.id))
              .map((icon) => {
                // Win95 fills the bin the moment anything lands in it.
                const binFull =
                  icon.id === 'recycle' && iconPositions.recycled.length > 0;

                return (
                  <DesktopIcon
                    key={icon.id}
                    icon={
                      binFull ? { ...icon, icon: RECYCLE_BIN_ICONS.full } : icon
                    }
                    position={cells[icon.id]}
                    selected={game.selectedIcon === icon.id}
                    onSelect={game.selectIcon}
                    onMove={(cell) => {
                      const drop = resolveIconDrop(
                        icon,
                        cell,
                        cells,
                        desktopIcons,
                      );

                      if (drop === 'refuse') {
                        audio.play('error');
                        return;
                      }

                      // Every landing sounds the same: the grid, the bin,
                      // and My Documents all take the icon with one tick.
                      audio.play('drop');

                      if (drop === 'recycle') {
                        recycleAndNote(icon.id);
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
                        items: iconContextMenu(icon, canEmpty),
                        onOpen: () => {
                          game.openDesktopIcon(icon.id);
                        },
                      });
                    }}
                  />
                );
              })}
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
                onClose={game.closeViaChrome}
                onJoke={game.showJoke}
                onFrozenClick={game.reactFrozen}
              >
                {meta.id === 'shopping' && (
                  <ShoppingWindow onBuy={game.buyToaster} />
                )}
                {meta.id === 'inbox' && (
                  <InboxWindow
                    loggedIn={game.loggedIn}
                    emails={game.emails}
                    selectedEmail={game.selectedEmail}
                    onLogin={game.login}
                    onSelect={game.selectEmail}
                    onOpen={game.openInboxEmail}
                    onDelete={game.deleteEmail}
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
                  ? { ...config, rows: windowRows(config) }
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
                        items: rowContextMenu(row, config.id),
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

          {game.defragOpen && (
            <DefragDialog
              onStopped={game.stopDefrag}
              onExit={game.exitDefrag}
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

          {pendingConfirm !== null && (
            <ConfirmDialog
              {...confirmFor(pendingConfirm)}
              onConfirm={() => {
                applyConfirm(pendingConfirm);
              }}
              onCancel={() => {
                setPendingConfirm(null);
              }}
            />
          )}

          {game.phase !== 'playing' && (
            <WinScreen
              title={objective.doneTitle}
              message={objective.doneMessage}
              icon={objective.icon}
              buttonLabel={isFinalTask ? 'Play again' : 'Next task'}
              onConfirm={isFinalTask ? handlePlayAgain : game.nextObjective}
            />
          )}
        </>
      )}

      {game.shutdownOpen && (
        <ShutdownDialog
          onConfirm={handleShutdown}
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
