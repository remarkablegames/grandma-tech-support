import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GRANDMA_LINES } from 'src/data/gameContent';

import { WinScreen } from '.';

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

const onPlayAgain = vi.fn();

describe('WinScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows grandma’s amused thank-you', () => {
    render(<WinScreen onPlayAgain={onPlayAgain} />);

    expect(
      screen.getByRole('dialog', { name: 'You found your email' }),
    ).toBeInTheDocument();
    expect(screen.getByText(GRANDMA_LINES.win)).toBeInTheDocument();
  });

  it('plays the win jingle when shown', () => {
    render(<WinScreen onPlayAgain={onPlayAgain} />);

    expect(play).toHaveBeenCalledWith('win');
  });

  it('restarts the game', async () => {
    const user = userEvent.setup();
    render(<WinScreen onPlayAgain={onPlayAgain} />);

    await user.click(screen.getByRole('button', { name: 'Play again' }));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
  });
});
