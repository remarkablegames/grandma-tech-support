import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WINDOW_META } from 'src/data/gameContent';

import { Taskbar } from '.';

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

const onStartToggle = vi.fn();
const onWindowClick = vi.fn();

function renderTaskbar(startOpen: boolean) {
  return render(
    <Taskbar
      windows={WINDOW_META}
      focusedId="inbox"
      startOpen={startOpen}
      onStartToggle={onStartToggle}
      onWindowClick={onWindowClick}
    />,
  );
}

describe('Taskbar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the start button, window buttons, and tray', () => {
    renderTaskbar(false);

    const start = screen.getByRole('button', { name: 'Start' });
    expect(start).toHaveAttribute('aria-haspopup', 'menu');
    expect(start).toHaveAttribute('aria-expanded', 'false');

    WINDOW_META.forEach((meta) => {
      expect(
        screen.getByRole('button', { name: `Switch to ${meta.title}` }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: 'Volume control' }),
    ).toBeInTheDocument();
    expect(screen.getByText('3:47 PM')).toBeInTheDocument();
  });

  it('presses the button of the focused window only', () => {
    renderTaskbar(true);

    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[1].title}` })
        .className,
    ).toContain('win-inset');
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[0].title}` })
        .className,
    ).toContain('win-button');
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('toggles start and asks to raise windows', async () => {
    const user = userEvent.setup();
    renderTaskbar(false);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(onStartToggle).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
    expect(play).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[0].title}` }),
    );
    expect(onWindowClick).toHaveBeenCalledWith('shopping');
    expect(play).toHaveBeenCalledTimes(2);
  });
});
