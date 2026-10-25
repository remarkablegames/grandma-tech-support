import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POWER_MESSAGES } from 'src/data/gameContent';

import { PowerScreen } from '.';

const onLeave = vi.fn();

describe('PowerScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('waits on the safe-off line until a click returns', async () => {
    const user = userEvent.setup();
    render(<PowerScreen mode="safe" onLeave={onLeave} />);

    const powerOff = screen.getByRole('button', { name: POWER_MESSAGES.safe });
    expect(powerOff).toHaveFocus();
    expect(screen.queryByText('_')).toBeNull();

    await user.click(powerOff);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('returns from the safe-off line on Enter and Space', async () => {
    const user = userEvent.setup();
    render(<PowerScreen mode="safe" onLeave={onLeave} />);

    await user.keyboard('{Enter}');
    expect(onLeave).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(onLeave).toHaveBeenCalledTimes(2);
  });

  it('shows the boot line with a blinking cursor and moves on its own', async () => {
    render(<PowerScreen mode="boot" onLeave={onLeave} />);

    expect(
      screen.getByRole('button', { name: POWER_MESSAGES.boot }),
    ).toBeInTheDocument();
    expect(screen.getByText('_')).toHaveClass('animate-blink');

    await waitFor(
      () => {
        expect(onLeave).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );
  });

  it('shows the clouds splash with the logo and wordmark', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PowerScreen mode="splash" onLeave={onLeave} />,
    );

    const splash = screen.getByRole('button', { name: 'Rainbow59' });
    expect(splash.style.backgroundImage).toBe('url("/src/assets/clouds.jpg")');
    expect(container.querySelector('img')).toHaveAttribute('src', 'logo.svg');

    await user.click(splash);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('auto-lifts the clouds splash after its beat', async () => {
    render(<PowerScreen mode="splash" onLeave={onLeave} />);

    await waitFor(
      () => {
        expect(onLeave).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );
  });

  it('clears the boot timer when it goes away early', async () => {
    const { unmount } = render(<PowerScreen mode="boot" onLeave={onLeave} />);

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 1200));

    expect(onLeave).not.toHaveBeenCalled();
  });
});
