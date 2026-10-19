import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JOKES } from 'src/data/gameContent';

import { VirusWindow } from '.';

vi.mock('src/services/audio', () => ({
  audio: {
    play: vi.fn(),
    getVolume: () => 100,
    isMuted: () => false,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

const onJoke = vi.fn();

describe('VirusWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the alarming alert', () => {
    render(<VirusWindow onJoke={onJoke} />);

    expect(screen.getByText(/VIRUS DETECTED/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'CLEAN MY COMPUTER NOW!' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Maybe later' }),
    ).toBeInTheDocument();
  });

  it('tells jokes for both fake actions', async () => {
    const user = userEvent.setup();
    render(<VirusWindow onJoke={onJoke} />);

    await user.click(
      screen.getByRole('button', { name: 'CLEAN MY COMPUTER NOW!' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.cleanNow);

    await user.click(screen.getByRole('button', { name: 'Maybe later' }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.maybeLater);
  });
});
