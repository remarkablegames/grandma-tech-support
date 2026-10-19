import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DESKTOP_ICONS,
  GRANDMA_LINES,
  JOKES,
  WINDOW_META,
} from 'src/data/gameContent';
import { firePointer } from 'src/tests/firePointer';

import { App } from '.';

const { play, startMusic, pauseMusic } = vi.hoisted(() => ({
  play: vi.fn(),
  startMusic: vi.fn(),
  pauseMusic: vi.fn(),
}));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
    startMusic,
    pauseMusic,
    getVolume: () => 100,
    isMuted: () => false,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    getMusicVolume: () => 100,
    isMusicMuted: () => false,
    setMusicVolume: vi.fn(),
    setMusicMuted: vi.fn(),
  },
}));

vi.mock('src/hooks/useCurrentTime', () => ({
  useCurrentTime: () => '12:34 PM',
}));

describe('App component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('greets with grandma’s instructions', () => {
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(GRANDMA_LINES.intro);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(
      screen.queryByRole('dialog', { name: 'You found your email' }),
    ).toBeNull();
  });

  it('starts the looping theme on mount and retries on first gesture', () => {
    const { unmount } = render(<App />);
    expect(startMusic).toHaveBeenCalledTimes(1);

    fireEvent.pointerDown(document);
    expect(startMusic).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(document);
    expect(startMusic).toHaveBeenCalledTimes(2);

    unmount();
    fireEvent.pointerDown(document);
    expect(startMusic).toHaveBeenCalledTimes(2);
  });

  it('pauses the theme while the tab is hidden and resumes on return', () => {
    const setVisibility = (state: DocumentVisibilityState) => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
      });
    };
    const { unmount } = render(<App />);

    setVisibility('hidden');
    fireEvent(document, new Event('visibilitychange'));
    expect(pauseMusic).toHaveBeenCalledTimes(1);

    setVisibility('visible');
    fireEvent(document, new Event('visibilitychange'));
    expect(startMusic).toHaveBeenCalledTimes(2);

    unmount();
    setVisibility('hidden');
    fireEvent(document, new Event('visibilitychange'));
    expect(pauseMusic).toHaveBeenCalledTimes(1);

    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('shows the three overlapping browser windows', () => {
    render(<App />);

    WINDOW_META.forEach((meta) => {
      expect(
        screen.getByRole('button', { name: meta.title }),
      ).toBeInTheDocument();
    });
    WINDOW_META.forEach((meta) => {
      expect(
        screen.getByRole('region', { name: meta.title }),
      ).toBeInTheDocument();
    });
  });

  it('shows desktop icons, taskbar, and both popups', () => {
    render(<App />);

    DESKTOP_ICONS.forEach((icon) => {
      expect(
        screen.getByRole('button', { name: icon.label }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Volume control' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12:34 PM')).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'CONGRATULATIONS!!!' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'Your mailbox is FULL' }),
    ).toBeInTheDocument();
  });

  it('brings clicked windows to the front', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: WINDOW_META[0].title }),
    );
    expect(play).toHaveBeenCalledWith('click');
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[0].title}` })
        .className,
    ).toContain('win-inset');
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[2].title}` })
        .className,
    ).toContain('win-button');

    await user.click(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[1].title}` }),
    );
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[1].title}` })
        .className,
    ).toContain('win-inset');
  });

  it('minimizes a window to the taskbar and restores it from there', async () => {
    const user = userEvent.setup();
    render(<App />);
    const meta = WINDOW_META[2];

    await user.click(
      within(screen.getByRole('region', { name: meta.title })).getByRole(
        'button',
        { name: `Minimize ${meta.title}` },
      ),
    );
    expect(screen.queryByRole('region', { name: meta.title })).toBeNull();

    await user.click(
      screen.getByRole('button', { name: `Switch to ${meta.title}` }),
    );
    expect(
      screen.getByRole('region', { name: meta.title }),
    ).toBeInTheDocument();
  });

  it('fills the desktop when maximized and restores back in place', async () => {
    const user = userEvent.setup();
    render(<App />);
    const meta = WINDOW_META[2];

    await user.click(
      within(screen.getByRole('region', { name: meta.title })).getByRole(
        'button',
        { name: `Maximize ${meta.title}` },
      ),
    );

    const maximized = screen.getByRole('region', { name: meta.title });
    expect(maximized.className).toContain('inset-x-0');
    expect(maximized.style.left).toBe('');

    await user.click(
      within(maximized).getByRole('button', { name: `Restore ${meta.title}` }),
    );

    const restored = screen.getByRole('region', { name: meta.title });
    expect(restored.className).not.toContain('inset-x-0');
    expect(restored.style.left).toBe('430px');
  });

  it('jokes about misleading buttons and lets the player retry', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Fix now!' }));
    expect(play).toHaveBeenCalledWith('error');
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.fixNow);

    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(
      screen.getByRole('dialog', { name: 'Your mailbox is FULL' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(GRANDMA_LINES.intro);
  });

  it('spawns extra popups when a liar Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    expect(play).toHaveBeenCalledWith('open');
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.liarClose);

    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(4);
    expect(screen.getByRole('status')).toHaveTextContent(GRANDMA_LINES.intro);
  });

  it('wins by safely dismissing the popup and opening the email', async () => {
    const user = userEvent.setup();
    render(<App />);

    // The safe little X — not the liar Close button.
    await user.click(screen.getAllByRole('button', { name: 'Close popup' })[1]);
    expect(play).toHaveBeenCalledWith('click');
    expect(
      screen.queryByRole('dialog', { name: 'Your mailbox is FULL' }),
    ).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(
      GRANDMA_LINES.correctClose,
    );

    await user.click(screen.getByRole('button', { name: /The Grandkids/ }));
    expect(play).toHaveBeenCalledWith('win');
    expect(
      screen.getByRole('dialog', { name: 'You found your email' }),
    ).toBeInTheDocument();
    expect(screen.getByText(GRANDMA_LINES.win)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Play again' }));
    expect(
      screen.queryByRole('dialog', { name: 'You found your email' }),
    ).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(GRANDMA_LINES.intro);
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
  });

  it('wires page, chrome, and product jokes through to the dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: `Back in ${WINDOW_META[0].title}` }),
    );
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.goBack);
    await user.click(screen.getByRole('button', { name: 'OK' }));

    await user.click(screen.getAllByRole('button', { name: 'Buy' })[0]);
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.buyButton);
    await user.click(screen.getByRole('button', { name: 'OK' }));

    // Dismiss the shopping popup safely, then click a product underneath.
    await user.click(screen.getAllByRole('button', { name: 'Close popup' })[0]);
    await user.click(screen.getAllByRole('button', { name: /Toaster/ })[0]);
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.toasterTile);
  });

  it('jokes about decoy emails and the broken desktop mail icon', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: 'Close popup' })[1]);
    await user.click(screen.getByRole('button', { name: /photos of the dog/ }));
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.emailDog);
    await user.click(screen.getByRole('button', { name: 'OK' }));

    const desktopMail = screen.getByRole('button', { name: 'Grandma’s Mail' });
    await user.click(desktopMail);
    expect(screen.getByRole('status')).toHaveTextContent(
      GRANDMA_LINES.mailDecoy,
    );
    expect(desktopMail).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not reward clicking the urgent virus warning', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'CLEAN MY COMPUTER NOW!' }),
    );
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.cleanNow);
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(
      screen.queryByRole('dialog', { name: 'You found your email' }),
    ).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(GRANDMA_LINES.intro);
  });

  it('opens the start menu and jokes about shut down', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Shut Down…' }));
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.startShutDown);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('drags a window across the desktop', () => {
    render(<App />);

    const region = screen.getByRole('region', { name: WINDOW_META[1].title });
    const startLeft = Number.parseInt(region.style.left, 10);
    const startTop = Number.parseInt(region.style.top, 10);

    firePointer(
      screen.getByRole('button', { name: WINDOW_META[1].title }),
      'pointerdown',
      { clientX: startLeft, clientY: startTop },
    );
    firePointer(window, 'pointermove', {
      clientX: startLeft + 160,
      clientY: startTop + 90,
    });

    expect(region.style.left).toBe(`${String(startLeft + 160)}px`);
    expect(region.style.top).toBe(`${String(startTop + 90)}px`);

    firePointer(window, 'pointerup');
  });
});
