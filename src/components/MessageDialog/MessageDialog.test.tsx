import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MessageDialog } from '.';

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

const onDismiss = vi.fn();

describe('MessageDialog component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the joke and closes on OK', async () => {
    const user = userEvent.setup();
    render(
      <MessageDialog message="That button lied, dear." onDismiss={onDismiss} />,
    );

    const dialog = screen.getByRole('alertdialog', { name: 'System Message' });
    expect(dialog).toHaveTextContent('That button lied, dear.');

    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
  });
});
