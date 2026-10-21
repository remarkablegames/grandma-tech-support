import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UPDATE_MESSAGES } from 'src/data/gameContent';

import { UpdateDialog } from '.';

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

const onAdvance = vi.fn();
const onLater = vi.fn();
const onRestart = vi.fn();

function renderDialog(stage: 'installing' | 'restored' | 'failed') {
  return render(
    <UpdateDialog
      stage={stage}
      onAdvance={onAdvance}
      onLater={onLater}
      onRestart={onRestart}
    />,
  );
}

describe('UpdateDialog component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stalls at 99% with Cancel driving it forward', async () => {
    const user = userEvent.setup();
    renderDialog('installing');

    expect(
      screen.getByRole('dialog', { name: 'Windows Update' }),
    ).toHaveTextContent(UPDATE_MESSAGES.installing);
    expect(
      screen.getByRole('progressbar', { name: 'Update progress' }),
    ).toHaveAttribute('aria-valuenow', '99');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onLater).not.toHaveBeenCalled();
    expect(onRestart).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledWith('click');
  });

  it('acknowledges the rollback with OK', async () => {
    const user = userEvent.setup();
    renderDialog('restored');

    expect(
      screen.getByRole('dialog', { name: 'Windows Update' }),
    ).toHaveTextContent(UPDATE_MESSAGES.restored);
    expect(screen.queryByRole('progressbar')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onLater).not.toHaveBeenCalled();
    expect(onRestart).not.toHaveBeenCalled();
  });

  it('offers Later and Restart now once the update fails', async () => {
    const user = userEvent.setup();
    renderDialog('failed');

    expect(
      screen.getByRole('dialog', { name: 'Windows Update' }),
    ).toHaveTextContent(UPDATE_MESSAGES.failed);
    expect(screen.queryByRole('progressbar')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Later' }));
    expect(onLater).toHaveBeenCalledTimes(1);
    expect(onAdvance).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Restart now' }));
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(onAdvance).not.toHaveBeenCalled();
  });
});
