import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POWER_MESSAGES } from 'src/data/gameContent';

import { BlackScreen } from '.';

const onReturn = vi.fn();

describe('BlackScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('waits on the safe-off line until a click returns', async () => {
    const user = userEvent.setup();
    render(<BlackScreen mode="safe" onReturn={onReturn} />);

    const powerOff = screen.getByRole('button', { name: POWER_MESSAGES.safe });
    expect(powerOff).toHaveFocus();
    expect(screen.queryByText('_')).toBeNull();

    await user.click(powerOff);
    expect(onReturn).toHaveBeenCalledTimes(1);
  });

  it('returns from the safe-off line on Enter and Space', async () => {
    const user = userEvent.setup();
    render(<BlackScreen mode="safe" onReturn={onReturn} />);

    await user.keyboard('{Enter}');
    expect(onReturn).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(onReturn).toHaveBeenCalledTimes(2);
  });

  it('shows the boot line with a blinking cursor and returns on its own', async () => {
    render(<BlackScreen mode="boot" onReturn={onReturn} />);

    expect(
      screen.getByRole('button', { name: POWER_MESSAGES.boot }),
    ).toBeInTheDocument();
    expect(screen.getByText('_')).toHaveClass('animate-blink');

    await waitFor(
      () => {
        expect(onReturn).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );
  });

  it('clears the boot timer when it goes away early', async () => {
    const { unmount } = render(<BlackScreen mode="boot" onReturn={onReturn} />);

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 1200));

    expect(onReturn).not.toHaveBeenCalled();
  });
});
