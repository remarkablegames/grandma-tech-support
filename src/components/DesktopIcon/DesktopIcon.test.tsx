import { render, screen } from '@testing-library/react';
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

const icon: DesktopIconConfig = {
  id: 'notes',
  label: 'Sticky Notes',
  icon: 'windows_icons_32x32/sticky_note.png',
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

    rerender(<DesktopIcon icon={icon} selected onSelect={onSelect} />);
    expect(
      screen.getByRole('button', { name: 'Sticky Notes' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
