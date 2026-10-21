import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

const onConfirm = vi.fn();
const message = 'You did it, my dear!';

describe('WinScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the given task dialog', () => {
    render(
      <WinScreen
        title="Task 1 of 6 complete"
        message={message}
        icon="windows_icons_32x32/sticky_note.png"
        buttonLabel="Next task"
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: 'Task 1 of 6 complete' }),
    ).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('plays the win jingle when shown', () => {
    render(
      <WinScreen
        title="Computer saved!"
        message={message}
        icon="windows_icons_32x32/password_manager.png"
        buttonLabel="Play again"
        onConfirm={onConfirm}
      />,
    );

    expect(play).toHaveBeenCalledWith('win');
  });

  it('runs the given confirm action', async () => {
    const user = userEvent.setup();
    render(
      <WinScreen
        title="Computer saved!"
        message={message}
        icon="windows_icons_32x32/password_manager.png"
        buttonLabel="Play again"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Play again' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
  });
});
