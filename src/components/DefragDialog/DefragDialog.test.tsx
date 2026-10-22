import { act, fireEvent, render, screen } from '@testing-library/react';

import { DefragDialog } from '.';

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
  },
}));

const onStopped = vi.fn();
const onExit = vi.fn();

describe('DefragDialog component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('climbs toward a tidy drive while the blocks settle', () => {
    render(<DefragDialog onStopped={onStopped} onExit={onExit} />);

    const bar = screen.getByRole('progressbar', {
      name: 'Defragment progress',
    });
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(
      screen.getByRole('dialog', { name: 'Disk Defragmenter' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/0% complete/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(bar).toHaveAttribute('aria-valuenow', '45');
    expect(screen.getByText(/45% complete/)).toBeInTheDocument();

    // It stops at 100 instead of rolling over.
    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('freezes the run on Stop and only a finished Exit finishes', () => {
    render(<DefragDialog onStopped={onStopped} onExit={onExit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStopped).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled();
    expect(screen.getByText('Stopped at 0% complete.')).toBeInTheDocument();

    // Frozen solid: no tick moves it again.
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(
      screen.getByRole('progressbar', { name: 'Defragment progress' }),
    ).toHaveAttribute('aria-valuenow', '0');

    // Exit mid-run reports unfinished.
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(onExit).toHaveBeenCalledWith(false);
  });

  it('hands back a finished run when the drive reaches 100', () => {
    render(<DefragDialog onStopped={onStopped} onExit={onExit} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(onExit).toHaveBeenCalledWith(true);
    expect(onStopped).not.toHaveBeenCalled();
  });
});
