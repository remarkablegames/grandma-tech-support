import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ICON_WINDOWS } from 'src/data/gameContent';
import { firePointer } from 'src/tests/firePointer';
import type { IconWindowConfig } from 'src/types/game';

import { IconWindow } from '.';

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
  },
}));

const listConfig: IconWindowConfig = {
  id: 'computer',
  title: 'My Computer',
  icon: 'windows_icons_32x32/this_computer.png',
  kind: 'list',
  rows: [
    { label: '3½ Floppy (A:)' },
    {
      icon: 'windows_icons_32x32/drive.png',
      label: 'Hard disk (C:)',
      hint: '2.1 GB',
    },
    { label: 'the_other_note.txt', opens: 'other-note' },
  ],
};

const scannerConfig: IconWindowConfig = {
  id: 'scanner',
  title: 'Virus Shield',
  icon: 'windows_icons_32x32/search.png',
  kind: 'scanner',
};

const onFocus = vi.fn();
const onMove = vi.fn();
const onMinimize = vi.fn();
const onClose = vi.fn();
const onOpenWindow = vi.fn();
const onOpenDesktop = vi.fn();
const onRestoreDesktop = vi.fn();
const onScanComplete = vi.fn();
const onContextMenu = vi.fn();

function renderIconWindow(
  config: IconWindowConfig = listConfig,
  contextMenuHandler?: (x: number, y: number) => void,
  restoreLabel?: string,
) {
  return render(
    <IconWindow
      config={config}
      position={{ x: 150, y: 100 }}
      zIndex={15}
      restoreLabel={restoreLabel}
      onFocus={onFocus}
      onMove={onMove}
      onMinimize={onMinimize}
      onClose={onClose}
      onOpenWindow={onOpenWindow}
      onOpenDesktop={onOpenDesktop}
      onRestoreDesktop={onRestoreDesktop}
      onScanComplete={onScanComplete}
      onContextMenu={contextMenuHandler}
    />,
  );
}

describe('IconWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a titled mini-window with a list of rows', () => {
    renderIconWindow();

    expect(
      screen.getByRole('region', { name: 'My Computer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('3½ Floppy (A:)')).toBeInTheDocument();
    expect(screen.getByText('Hard disk (C:)')).toBeInTheDocument();
    expect(screen.getByText('2.1 GB')).toBeInTheDocument();
    expect(screen.getByText('the_other_note.txt')).toBeInTheDocument();
    // Windows without restore duties get no toolbar at all.
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull();
  });

  it('holds an empty list open with one blank row', () => {
    renderIconWindow({ ...listConfig, rows: [] });

    // Nothing to list: the pane keeps a single blank row (screen readers
    // skip it) so the window never collapses to a sliver.
    expect(screen.getByRole('list').children).toHaveLength(1);
  });

  it('opens a filed desktop shortcut row like the icon it came from', async () => {
    const user = userEvent.setup();
    renderIconWindow({
      id: 'documents',
      title: 'My Documents',
      icon: 'windows_icons_32x32/folder_closed.png',
      kind: 'list',
      rows: [
        {
          icon: 'windows_icons_32x32/calculator.png',
          label: 'Calculator',
          hint: 'shortcut',
          desktopId: 'calculator',
        },
      ],
    });

    await user.dblClick(screen.getByRole('button', { name: /Calculator/ }));

    expect(onOpenDesktop).toHaveBeenCalledWith('calculator');
    expect(onOpenWindow).not.toHaveBeenCalled();
  });

  it('keeps Restore greyed out until a restorable row is selected', async () => {
    const user = userEvent.setup();
    renderIconWindow(
      {
        id: 'recycle',
        title: 'Recycle Bin',
        icon: 'windows_icons_32x32/recycle_bin_empty.png',
        kind: 'list',
        rows: [
          {
            icon: 'windows_icons_32x32/program.png',
            label: 'toaster_7_install.exe',
          },
          {
            icon: 'windows_icons_32x32/sticky_note.png',
            label: 'Sticky Notes',
            desktopId: 'notes',
          },
        ],
      },
      undefined,
      'Restore',
    );

    const restore = screen.getByRole('button', { name: 'Restore' });
    expect(restore).toBeDisabled();

    // The bin's joke files came with the machine; only real victims restore.
    await user.click(
      screen.getByRole('button', { name: 'toaster_7_install.exe' }),
    );
    expect(restore).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Sticky Notes' }));
    expect(restore).toBeEnabled();

    await user.click(restore);
    expect(onRestoreDesktop).toHaveBeenCalledWith('notes');
  });

  it('opens a file row on a quick double-click', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    await user.dblClick(
      screen.getByRole('button', { name: 'the_other_note.txt' }),
    );

    expect(onOpenWindow).toHaveBeenCalledWith('other-note');
    expect(onOpenWindow).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'the_other_note.txt' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens a Notepad window for every file in My Documents', async () => {
    const user = userEvent.setup();
    const documents = ICON_WINDOWS.find((config) => config.id === 'documents');
    if (documents?.kind !== 'list') {
      throw new Error('My Documents list config is missing');
    }
    renderIconWindow(documents);

    for (const row of documents.rows) {
      await user.dblClick(screen.getByRole('button', { name: row.label }));

      expect(row.opens).toBeDefined();
      expect(onOpenWindow).toHaveBeenLastCalledWith(row.opens);
      expect(ICON_WINDOWS.find((config) => config.id === row.opens)?.kind).toBe(
        'note',
      );
    }
  });

  it('selects a row on a single click, like a desktop icon', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    await user.click(screen.getByText('3½ Floppy (A:)'));
    expect(
      screen.getByRole('button', { name: '3½ Floppy (A:)' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /Hard disk/ }));
    expect(
      screen.getByRole('button', { name: '3½ Floppy (A:)' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Hard disk/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    const fileRow = screen.getByRole('button', { name: 'the_other_note.txt' });
    await user.click(fileRow);
    expect(fileRow).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Hard disk/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('opens a file row with Enter right away', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    screen.getByRole('button', { name: 'the_other_note.txt' }).focus();
    await user.keyboard('{Enter}');

    expect(onOpenWindow).toHaveBeenCalledWith('other-note');
  });

  it('leaves plain rows and lone clicks alone', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    await user.click(screen.getByText('3½ Floppy (A:)'));
    await user.click(
      screen.getByRole('button', { name: 'the_other_note.txt' }),
    );

    expect(onOpenWindow).not.toHaveBeenCalled();
  });

  it('renders the sticky note contents', () => {
    renderIconWindow({
      id: 'notes',
      title: 'Sticky Notes',
      icon: 'windows_icons_32x32/sticky_note.png',
      kind: 'note',
      lines: ['THE PASSWORD', '(it’s on the other note)'],
    });

    expect(screen.getByText('THE PASSWORD')).toBeInTheDocument();
    expect(screen.getByText('(it’s on the other note)')).toBeInTheDocument();
  });

  it('accepts digits but every equals shows 42', async () => {
    const user = userEvent.setup();
    renderIconWindow({
      id: 'calculator',
      title: 'Calculator',
      icon: 'windows_icons_32x32/calculator.png',
      kind: 'calculator',
    });

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('12');

    await user.click(screen.getByRole('button', { name: '=' }));
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('42');

    await user.click(screen.getByRole('button', { name: 'C' }));
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('0');
  });

  it('scans for a few ticks, reports the toaster, and can scan again', async () => {
    const user = userEvent.setup();
    renderIconWindow(scannerConfig);

    expect(screen.getByText('Ready to scan C:\\')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Scan' }));
    expect(screen.getByText(/Scanning C:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled();

    expect(
      await screen.findByText(
        '1 threat quarantined: toaster_7_install.exe',
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    // The completion callback fires from a passive effect after the result
    // renders, so wait for it instead of racing React's effect flush.
    await waitFor(() => {
      expect(onScanComplete).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole('button', { name: 'Scan again' }));
    expect(screen.getByText(/Scanning C:/)).toBeInTheDocument();
  });

  it('closes through the title-bar ×', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    await user.click(screen.getByRole('button', { name: 'Close My Computer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('minimizes through the title-bar –', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    await user.click(
      screen.getByRole('button', { name: 'Minimize My Computer' }),
    );

    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('raises on pointerdown with a click tick', () => {
    renderIconWindow();

    firePointer(
      screen.getByRole('region', { name: 'My Computer' }),
      'pointerdown',
    );

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
  });

  it('raises on a right-press without a click tick', () => {
    renderIconWindow();

    firePointer(
      screen.getByRole('region', { name: 'My Computer' }),
      'pointerdown',
      { button: 2 },
    );

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(play).not.toHaveBeenCalledWith('click');
  });

  it('drags by the title bar, clamped to the viewport', () => {
    renderIconWindow();

    firePointer(screen.getByText('My Computer'), 'pointerdown', {
      clientX: 150,
      clientY: 100,
    });
    firePointer(window, 'pointermove', { clientX: 250, clientY: 160 });
    expect(onMove).toHaveBeenLastCalledWith({ x: 250, y: 160 });

    firePointer(window, 'pointermove', { clientX: 9999, clientY: -50 });
    expect(onMove).toHaveBeenLastCalledWith({ x: 874, y: 0 });

    firePointer(window, 'pointerup');
  });

  it('stops dragging once the pointer is released', () => {
    renderIconWindow();

    firePointer(screen.getByText('My Computer'), 'pointerdown', {
      clientX: 150,
      clientY: 100,
    });
    firePointer(window, 'pointerup');
    firePointer(window, 'pointermove', { clientX: 300, clientY: 200 });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('reports a right-click for the folder menu', () => {
    renderIconWindow(listConfig, onContextMenu);

    const prevented = fireEvent.contextMenu(
      screen.getByRole('region', { name: 'My Computer' }),
      { clientX: 40, clientY: 64 },
    );

    expect(prevented).toBe(false);
    expect(onContextMenu).toHaveBeenCalledWith(40, 64);
  });

  it('reports a right-clicked row and holds the window menu back', () => {
    renderIconWindow(listConfig, onContextMenu);

    const prevented = fireEvent.contextMenu(
      screen.getByText('Hard disk (C:)'),
      { clientX: 48, clientY: 72 },
    );

    expect(prevented).toBe(false);
    // Exactly once: the row stopped propagation before the window body.
    expect(onContextMenu).toHaveBeenCalledTimes(1);
    expect(onContextMenu).toHaveBeenCalledWith(48, 72, listConfig.rows[1]);
  });

  it('still swallows the native menu without a handler', () => {
    renderIconWindow();

    const prevented = fireEvent.contextMenu(
      screen.getByRole('region', { name: 'My Computer' }),
    );

    expect(prevented).toBe(false);
    expect(onContextMenu).not.toHaveBeenCalled();
  });
});
