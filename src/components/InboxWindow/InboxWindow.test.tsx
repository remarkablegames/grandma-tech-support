import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JOKES } from 'src/data/gameContent';

import { InboxWindow } from '.';

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
const onOpenEmail = vi.fn();

describe('InboxWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists the emails', () => {
    render(<InboxWindow onJoke={onJoke} onOpenEmail={onOpenEmail} />);

    expect(
      screen.getByRole('button', { name: /The Grandkids/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /photos of the dog/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Important!!/ }),
    ).toBeInTheDocument();
  });

  it('opens the target email', async () => {
    const user = userEvent.setup();
    render(<InboxWindow onJoke={onJoke} onOpenEmail={onOpenEmail} />);

    await user.click(screen.getByRole('button', { name: /The Grandkids/ }));
    expect(onOpenEmail).toHaveBeenCalledTimes(1);
    expect(onJoke).not.toHaveBeenCalled();
  });

  it('jokes about the decoy emails instead', async () => {
    const user = userEvent.setup();
    render(<InboxWindow onJoke={onJoke} onOpenEmail={onOpenEmail} />);

    await user.click(screen.getByRole('button', { name: /photos of the dog/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailDog);

    await user.click(screen.getByRole('button', { name: /Important!!/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailUpdate);
    expect(onOpenEmail).not.toHaveBeenCalled();
  });
});
