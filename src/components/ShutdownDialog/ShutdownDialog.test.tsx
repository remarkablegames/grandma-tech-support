import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ShutdownDialog } from '.';

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
  },
}));

const onConfirm = vi.fn();
const onCancel = vi.fn();

describe('ShutdownDialog component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens on the shut down radio with OK focused', () => {
    render(<ShutdownDialog onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('dialog', { name: 'Shut Down' })).toHaveTextContent(
      'Are you sure you want to:',
    );
    expect(
      screen.getByRole('radio', { name: 'Shut down the computer?' }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Restart the computer?' }),
    ).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
  });

  it('confirms shut down by default with a click tick', async () => {
    const user = userEvent.setup();
    render(<ShutdownDialog onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(onConfirm).toHaveBeenCalledWith('shutdown');
    expect(play).toHaveBeenCalledWith('click');
  });

  it('confirms restart once its radio is picked', async () => {
    const user = userEvent.setup();
    render(<ShutdownDialog onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(
      screen.getByRole('radio', { name: 'Restart the computer?' }),
    );
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(onConfirm).toHaveBeenCalledWith('restart');
    expect(onConfirm).not.toHaveBeenCalledWith('shutdown');
  });

  it('switches back when the default radio is picked again', async () => {
    const user = userEvent.setup();
    render(<ShutdownDialog onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(
      screen.getByRole('radio', { name: 'Restart the computer?' }),
    );
    await user.click(
      screen.getByRole('radio', { name: 'Shut down the computer?' }),
    );
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(
      screen.getByRole('radio', { name: 'Shut down the computer?' }),
    ).toBeChecked();
    expect(onConfirm).toHaveBeenCalledWith('shutdown');
  });

  it('cancels without confirming', async () => {
    const user = userEvent.setup();
    render(<ShutdownDialog onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledWith('click');
  });
});
