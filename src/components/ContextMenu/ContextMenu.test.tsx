import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DESKTOP_CONTEXT_MENU } from 'src/data/gameContent';
import type { ContextMenuItem } from 'src/types/game';

import { ContextMenu } from '.';

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
    getVolume: () => 100,
    isMuted: () => false,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

const onSelect = vi.fn();
const onDismiss = vi.fn();

function renderMenu(
  items: ContextMenuItem[] = DESKTOP_CONTEXT_MENU,
  x = 100,
  y = 120,
) {
  return render(
    <ContextMenu
      x={x}
      y={y}
      items={items}
      onSelect={onSelect}
      onDismiss={onDismiss}
    />,
  );
}

describe('ContextMenu component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Win95’s entries with greyed-out items and separators', () => {
    renderMenu();

    const menu = screen.getByRole('menu', { name: 'Context menu' });
    expect(menu).toBeInTheDocument();
    expect(menu.style.left).toBe('100px');
    expect(menu.style.top).toBe('120px');

    expect(screen.getAllByRole('menuitem')).toHaveLength(6);
    expect(screen.getAllByRole('separator')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Paste' })).toBeDisabled();
    expect(
      screen.getByRole('menuitem', { name: 'Paste Shortcut' }),
    ).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Refresh' })).toBeEnabled();
  });

  it('focuses the first enabled entry', () => {
    renderMenu();

    expect(
      screen.getByRole('menuitem', { name: 'Arrange Icons' }),
    ).toHaveFocus();
  });

  it('skips greyed-out entries when focusing', () => {
    renderMenu([
      { id: 'grey', label: 'Greyed out', disabled: true },
      { id: 'live', label: 'Live entry', message: 'hello' },
    ]);

    expect(
      screen.getByRole('menuitem', { name: 'Greyed out' }),
    ).not.toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Live entry' })).toHaveFocus();
  });

  it('reports the picked entry with a click tick', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Refresh' }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'refresh' }),
    );
    expect(play).toHaveBeenCalledWith('click');
    // The press landed inside the menu, so it is not an outside dismiss.
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses on an outside press or Escape', () => {
    renderMenu();

    fireEvent.pointerDown(document.body);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(2);

    // Any other key leaves the menu open.
    fireEvent.keyDown(document, { key: 'Shift' });
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('stops listening once unmounted', () => {
    const { unmount } = renderMenu();

    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('nudges itself back inside the viewport at the edge', () => {
    renderMenu(DESKTOP_CONTEXT_MENU, 5000, 9000);

    const menu = screen.getByRole('menu', { name: 'Context menu' });
    expect(menu.style.left).toBe(`${String(window.innerWidth)}px`);
    expect(menu.style.top).toBe(`${String(window.innerHeight)}px`);
  });
});
