import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const icon: DesktopIconConfig = {
  id: 'notes',
  label: 'Sticky Notes',
  icon: 'windows_icons_32x32/sticky_note.png',
  windowId: 'notes',
};

describe('DesktopIcon component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders its label unselected', () => {
    render(<DesktopIcon icon={icon} selected={false} onSelect={onSelect} />);

    expect(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports clicks and reflects selection', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DesktopIcon icon={icon} selected={false} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('button', { name: 'Sticky Notes' }));
    expect(onSelect).toHaveBeenCalledWith(icon);
    expect(play).toHaveBeenCalledWith('click');
    expect(onOpen).not.toHaveBeenCalled();

    rerender(<DesktopIcon icon={icon} selected onSelect={onSelect} />);
    expect(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens on a double-click while still selecting', async () => {
    const user = userEvent.setup();
    render(
      <DesktopIcon
        icon={icon}
        selected={false}
        onSelect={onSelect}
        onOpen={onOpen}
      />,
    );

    await user.dblClick(screen.getByRole('button', { name: 'Sticky Notes' }));

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens on Enter for keyboard users', async () => {
    const user = userEvent.setup();
    render(
      <DesktopIcon
        icon={icon}
        selected={false}
        onSelect={onSelect}
        onOpen={onOpen}
      />,
    );

    await user.keyboard('{Tab}');
    await user.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('selects itself and reports a right-click', () => {
    const onContextMenu = vi.fn();
    render(
      <DesktopIcon
        icon={icon}
        selected={false}
        onSelect={onSelect}
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
    render(<DesktopIcon icon={icon} selected={false} onSelect={onSelect} />);

    const prevented = fireEvent.contextMenu(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    );

    expect(prevented).toBe(false);
    expect(onSelect).toHaveBeenCalledWith(icon);
  });
});
