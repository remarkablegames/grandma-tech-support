import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { firePointer } from 'src/tests/firePointer';
import type { DesktopIconConfig } from 'src/types/game';

import { DesktopIcon } from '.';

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
const onOpen = vi.fn();
const onMove = vi.fn();

const icon: DesktopIconConfig = {
  id: 'notes',
  label: 'Sticky Notes',
  icon: 'windows_icons_32x32/sticky_note.png',
  windowId: 'notes',
};

function renderIcon(position = { col: 0, row: 0 }) {
  render(
    <DesktopIcon
      icon={icon}
      position={position}
      selected={false}
      onSelect={onSelect}
      onMove={onMove}
      onOpen={onOpen}
    />,
  );

  return screen.getByRole('button', { name: 'Sticky Notes' });
}

describe('DesktopIcon component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders its label unselected', () => {
    renderIcon();

    expect(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports clicks and reflects selection', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DesktopIcon
        icon={icon}
        position={{ col: 0, row: 0 }}
        selected={false}
        onSelect={onSelect}
        onMove={onMove}
        onOpen={onOpen}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sticky Notes' }));
    expect(onSelect).toHaveBeenCalledWith(icon);
    expect(play).toHaveBeenCalledWith('click');
    expect(onOpen).not.toHaveBeenCalled();

    rerender(
      <DesktopIcon
        icon={icon}
        position={{ col: 0, row: 0 }}
        selected
        onSelect={onSelect}
        onMove={onMove}
        onOpen={onOpen}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens on a double-click while still selecting', async () => {
    const user = userEvent.setup();
    renderIcon();

    await user.dblClick(screen.getByRole('button', { name: 'Sticky Notes' }));

    expect(onSelect).toHaveBeenCalledTimes(4);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens on Enter for keyboard users', async () => {
    const user = userEvent.setup();
    renderIcon();

    await user.keyboard('{Tab}');
    await user.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('selects itself and reports a right-click', () => {
    const onContextMenu = vi.fn();
    render(
      <DesktopIcon
        icon={icon}
        position={{ col: 0, row: 0 }}
        selected={false}
        onSelect={onSelect}
        onMove={onMove}
        onContextMenu={onContextMenu}
      />,
    );

    const prevented = fireEvent.contextMenu(
      screen.getByRole('button', { name: 'Sticky Notes' }),
      { clientX: 48, clientY: 96 },
    );

    expect(prevented).toBe(false);
    expect(onSelect).toHaveBeenCalledWith(icon);
    expect(onContextMenu).toHaveBeenCalledWith(48, 96);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('still swallows the native menu without a handler', () => {
    render(
      <DesktopIcon
        icon={icon}
        position={{ col: 0, row: 0 }}
        selected={false}
        onSelect={onSelect}
        onMove={onMove}
      />,
    );

    const prevented = fireEvent.contextMenu(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    );

    expect(prevented).toBe(false);
    expect(onSelect).toHaveBeenCalledWith(icon);
  });

  it('drags with the pointer and drops onto the grid, selected', () => {
    const button = renderIcon({ col: 1, row: 2 });

    firePointer(button, 'pointerdown', { clientX: 100, clientY: 100 });
    firePointer(window, 'pointermove', { clientX: 102, clientY: 100 });
    // Past the four-pixel threshold the icon rides every move of the
    // pointer...
    firePointer(window, 'pointermove', { clientX: 150, clientY: 140 });
    expect(button.style.transform).toBe('translate(50px, 40px)');
    firePointer(window, 'pointermove', { clientX: 205, clientY: 185 });
    expect(button.style.transform).toBe('translate(105px, 85px)');

    firePointer(window, 'pointerup', {});

    // ...and lands snapped: (1*80+105)/80 → col 2, (2*80+85)/80 → row 3.
    expect(onMove).toHaveBeenCalledWith({ col: 2, row: 3 });
    // Selected once on the press and once more on the drop.
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith(icon);
    expect(button.style.transform).toBe('');
  });

  it('selects the instant it is pressed, Win95 mouse-down style', () => {
    const button = renderIcon();

    firePointer(button, 'pointerdown', { clientX: 100, clientY: 100 });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(icon);
  });

  it('stays a click below the drag threshold', () => {
    const button = renderIcon();

    firePointer(button, 'pointerdown', { clientX: 100, clientY: 100 });
    firePointer(window, 'pointermove', { clientX: 102, clientY: 100 });
    firePointer(window, 'pointerup', {});

    expect(button.style.transform).toBe('');
    expect(onMove).not.toHaveBeenCalled();
    // The press alone selected it; the sub-threshold move added nothing.
    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('swallows the click a drop leaves behind but spares the keyboard', () => {
    const button = renderIcon();

    firePointer(button, 'pointerdown', { clientX: 50, clientY: 50 });
    firePointer(window, 'pointermove', { clientX: 200, clientY: 50 });
    firePointer(window, 'pointerup', {});
    // The press selected it and the drop kept it selected.
    expect(onSelect).toHaveBeenCalledTimes(2);

    // Keyboard activation right after a drop still opens: detail === 0 is
    // never a drop's tail.
    fireEvent.click(button, { detail: 0 });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(3);

    // The drop's own tail click is swallowed, then clicks work again.
    fireEvent.click(button, { detail: 1 });
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onOpen).toHaveBeenCalledTimes(1);
    fireEvent.click(button, { detail: 1 });
    expect(onSelect).toHaveBeenCalledTimes(4);
  });

  it('ignores the right button', () => {
    const button = renderIcon();

    firePointer(button, 'pointerdown', { button: 2, clientX: 10, clientY: 10 });
    firePointer(window, 'pointermove', { clientX: 200, clientY: 200 });
    firePointer(window, 'pointerup', {});

    expect(onMove).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('lets a cancelled drag fall back into place', () => {
    const button = renderIcon();

    firePointer(button, 'pointerdown', { clientX: 50, clientY: 50 });
    firePointer(window, 'pointermove', { clientX: 150, clientY: 150 });
    expect(button.style.transform).toBe('translate(100px, 100px)');

    firePointer(window, 'pointercancel', {});
    expect(button.style.transform).toBe('');
    expect(onMove).not.toHaveBeenCalled();
    // The press already selected it, and the cancel left it that way.
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('keeps a wild drop on the screen', () => {
    const button = renderIcon({ col: 1, row: 1 });

    firePointer(button, 'pointerdown', { clientX: 50, clientY: 50 });
    firePointer(window, 'pointermove', { clientX: 9999, clientY: -9999 });
    firePointer(window, 'pointerup', {});

    // jsdom's viewport is 1024x768: the far corner is col 11, row 0.
    expect(onMove).toHaveBeenCalledWith({ col: 11, row: 0 });
  });
});
