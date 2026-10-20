import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import {
  DESKTOP_ICONS,
  GRANDMA_LINES,
  JOKES,
  OBJECTIVES,
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

// The desktop opens blank, so most flows start by launching the Inbox.
async function openFromStart(user: UserEvent, label: string) {
  await user.click(screen.getByRole('button', { name: 'Start' }));
  await user.click(screen.getByRole('menuitem', { name: label }));
}

// Task 1 in one go: launch the Inbox, log in, move on to the chaos task.
async function logInThroughStart(user: UserEvent) {
  await openFromStart(user, 'Inbox');
  await user.type(screen.getByLabelText('Password'), 'password');
  await user.click(screen.getByRole('button', { name: 'Log in' }));
  await user.click(screen.getByRole('button', { name: 'Next task' }));
}

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
      screen.queryByRole('dialog', { name: OBJECTIVES[0].doneTitle }),
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

  it('opens browser windows from the Start menu and closes them for real', async () => {
    const user = userEvent.setup();
    render(<App />);

    // The desktop starts with nothing open.
    expect(
      screen.queryByRole('region', { name: WINDOW_META[1].title }),
    ).toBeNull();

    await openFromStart(user, 'Inbox');
    expect(
      screen.getByRole('region', { name: WINDOW_META[1].title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[1].title}` }),
    ).toBeInTheDocument();

    await openFromStart(user, 'Internet');
    expect(
      screen.getByRole('region', { name: WINDOW_META[0].title }),
    ).toBeInTheDocument();

    // The title-bar X closes it for real: frame and taskbar button both go.
    await user.click(
      within(
        screen.getByRole('region', { name: WINDOW_META[1].title }),
      ).getByRole('button', { name: `Close ${WINDOW_META[1].title}` }),
    );
    expect(
      screen.queryByRole('region', { name: WINDOW_META[1].title }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', {
        name: `Switch to ${WINDOW_META[1].title}`,
      }),
    ).toBeNull();
    expect(
      screen.getByRole('region', { name: WINDOW_META[0].title }),
    ).toBeInTheDocument();
  });

  it('starts on a blank desktop with the icons and tray', () => {
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

    // No windows, no pop-ups: the evening starts quiet.
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    expect(
      screen.queryAllByRole('button', { name: /^Switch to/ }),
    ).toHaveLength(0);
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });

  it('brings clicked windows to the front', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openFromStart(user, 'Inbox');
    await openFromStart(user, 'Internet');

    await user.click(
      screen.getByRole('button', { name: WINDOW_META[0].title }),
    );
    expect(play).toHaveBeenCalledWith('click');
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[0].title}` })
        .className,
    ).toContain('win-inset');
    expect(
      screen.getByRole('button', { name: `Switch to ${WINDOW_META[1].title}` })
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

  it('minimizes a window to the taskbar and toggles it from there', async () => {
    const user = userEvent.setup();
    render(<App />);
    const meta = WINDOW_META[1];

    await openFromStart(user, 'Inbox');

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

    // Now it's the focused window, so its taskbar button minimizes again.
    await user.click(
      screen.getByRole('button', { name: `Switch to ${meta.title}` }),
    );
    expect(screen.queryByRole('region', { name: meta.title })).toBeNull();
  });

  it('fills the desktop when maximized and restores back in place', async () => {
    const user = userEvent.setup();
    render(<App />);
    const meta = WINDOW_META[1];

    await openFromStart(user, 'Inbox');

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
    expect(restored.style.left).toBe('340px');
  });

  it('jokes about misleading buttons and lets the player retry', async () => {
    const user = userEvent.setup();
    render(<App />);

    await logInThroughStart(user);

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
    expect(screen.getByRole('status')).toHaveTextContent(
      OBJECTIVES[1].instruction,
    );
  }, 15000);

  it('spawns extra popups when a liar Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await logInThroughStart(user);

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    expect(play).toHaveBeenCalledWith('open');
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.liarClose);

    await user.click(screen.getByRole('button', { name: 'OK' }));
    // Deal plus two spam in Shopping, mailbox-full in the Inbox, plus the
    // two fresh spam the liar button just spawned.
    expect(screen.getAllByRole('dialog')).toHaveLength(6);
    expect(screen.getByRole('status')).toHaveTextContent(
      OBJECTIVES[1].instruction,
    );
  }, 15000);

  it('logs in, dismisses the popup, and opens the email', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Task 1 — launch the mail, then the password lives on the other note.
    await openFromStart(user, 'Inbox');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(play).toHaveBeenCalledWith('win');
    expect(
      screen.getByRole('dialog', { name: OBJECTIVES[0].doneTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(OBJECTIVES[0].doneMessage)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next task' }));
    expect(
      screen.queryByRole('dialog', { name: OBJECTIVES[0].doneTitle }),
    ).toBeNull();

    // The safe little X — not the liar Close button.
    await user.click(
      within(
        screen.getByRole('dialog', { name: 'Your mailbox is FULL' }),
      ).getByRole('button', { name: 'Close popup' }),
    );
    expect(play).toHaveBeenCalledWith('click');
    expect(
      screen.queryByRole('dialog', { name: 'Your mailbox is FULL' }),
    ).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(
      GRANDMA_LINES.correctClose,
    );

    // Task 2 — the real email wins; task 3 waits behind "Next task".
    await user.click(screen.getByRole('button', { name: /The Grandkids/ }));
    expect(play).toHaveBeenCalledWith('win');
    expect(
      screen.getByRole('dialog', { name: OBJECTIVES[1].doneTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(GRANDMA_LINES.win)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next task' }));
    expect(
      screen.queryByRole('dialog', { name: OBJECTIVES[1].doneTitle }),
    ).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(
      OBJECTIVES[2].instruction,
    );
  }, 15000);

  it('wires page, chrome, and product jokes through to the dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await logInThroughStart(user);

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
  }, 15000);

  it('jokes about decoy emails and the broken desktop mail icon', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Get past the log-on gate first.
    await logInThroughStart(user);

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

    await user.dblClick(desktopMail);
    expect(screen.queryByRole('region', { name: 'Grandma’s Mail' })).toBeNull();
  }, 15000);

  it('opens a desktop icon window on double-click and closes it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.dblClick(screen.getByRole('button', { name: 'My Computer' }));

    const iconWindow = screen.getByRole('region', { name: 'My Computer' });
    expect(iconWindow).toBeInTheDocument();

    await user.click(
      within(iconWindow).getByRole('button', { name: 'Close My Computer' }),
    );
    expect(screen.queryByRole('region', { name: 'My Computer' })).toBeNull();
  });

  it('drags an icon window across the desktop', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.dblClick(screen.getByRole('button', { name: 'My Computer' }));

    const region = screen.getByRole('region', { name: 'My Computer' });
    const startLeft = Number.parseInt(region.style.left, 10);
    const startTop = Number.parseInt(region.style.top, 10);

    firePointer(within(region).getByText('My Computer'), 'pointerdown', {
      clientX: startLeft,
      clientY: startTop,
    });
    firePointer(window, 'pointermove', {
      clientX: startLeft + 60,
      clientY: startTop + 40,
    });

    expect(region.style.left).toBe(`${String(startLeft + 60)}px`);
    expect(region.style.top).toBe(`${String(startTop + 40)}px`);

    firePointer(window, 'pointerup');
  });

  it('does not reward clicking the urgent virus warning', async () => {
    const user = userEvent.setup();
    render(<App />);

    // The virus window springs open with the task-2 chaos.
    await logInThroughStart(user);

    await user.click(
      screen.getByRole('button', { name: 'CLEAN MY COMPUTER NOW!' }),
    );
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.cleanNow);
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(
      screen.queryByRole('dialog', { name: OBJECTIVES[0].doneTitle }),
    ).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(
      OBJECTIVES[1].instruction,
    );
  }, 15000);

  it('opens the start menu and jokes about shut down', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Shut Down...' }));
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.startShutDown);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('drags a window across the desktop', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openFromStart(user, 'Inbox');

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

  it('minimizes an icon window and toggles it from the taskbar', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.dblClick(screen.getByRole('button', { name: 'My Computer' }));

    // The title-bar minimize button hides it but keeps its taskbar button.
    const region = screen.getByRole('region', { name: 'My Computer' });
    await user.click(
      within(region).getByRole('button', { name: 'Minimize My Computer' }),
    );
    expect(screen.queryByRole('region', { name: 'My Computer' })).toBeNull();

    const taskbarButton = screen.getByRole('button', {
      name: 'Switch to My Computer',
    });
    await user.click(taskbarButton);
    expect(
      screen.getByRole('region', { name: 'My Computer' }),
    ).toBeInTheDocument();

    // Focused window's button minimizes again (Win95 toggle).
    await user.click(taskbarButton);
    expect(screen.queryByRole('region', { name: 'My Computer' })).toBeNull();

    // Double-clicking the desktop icon restores it.
    await user.dblClick(screen.getByRole('button', { name: 'My Computer' }));
    expect(
      screen.getByRole('region', { name: 'My Computer' }),
    ).toBeInTheDocument();
  });

  it('orders icon taskbar buttons by raise order', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.dblClick(screen.getByRole('button', { name: 'My Computer' }));
    await user.dblClick(screen.getByRole('button', { name: 'Sticky Notes' }));

    // Raising My Computer moves its taskbar button to the rightmost slot.
    await user.click(
      screen.getByRole('button', { name: 'Switch to My Computer' }),
    );

    const iconButtons = screen
      .getAllByRole('button', {
        name: /^Switch to (My Computer|Sticky Notes)$/,
      })
      .map((button) => button.textContent);

    expect(iconButtons).toEqual(['Sticky Notes', 'My Computer']);
  });

  it('plays through the whole mission chain', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Task 1 — the sticky note points at the other note.
    await user.dblClick(screen.getByRole('button', { name: 'Sticky Notes' }));
    expect(
      within(screen.getByRole('region', { name: 'Sticky Notes' })).getByText(
        '(it’s on the other note)',
      ),
    ).toBeInTheDocument();

    await user.dblClick(screen.getByRole('button', { name: 'My Documents' }));
    await user.dblClick(
      within(screen.getByRole('region', { name: 'My Documents' })).getByRole(
        'button',
        { name: 'the_other_note.txt' },
      ),
    );
    const notepad = await screen.findByRole('region', {
      name: 'the_other_note.txt — Notepad',
    });
    expect(
      within(notepad).getByText('the password is “password”.'),
    ).toBeInTheDocument();

    await openFromStart(user, 'Inbox');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(
      screen.getByRole('dialog', { name: OBJECTIVES[0].doneTitle }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next task' }));

    // Task 2 — the email list replaces the log-on form.
    expect(screen.queryByRole('button', { name: 'Log in' })).toBeNull();
    await user.click(screen.getByRole('button', { name: /The Grandkids/ }));
    expect(
      screen.getByRole('dialog', { name: OBJECTIVES[1].doneTitle }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next task' }));

    // Task 3 — the first click jokes and storms the whole desktop...
    await user.click(screen.getAllByRole('button', { name: /Toaster/ })[0]);
    expect(
      screen.getByRole('alertdialog', { name: 'System Message' }),
    ).toHaveTextContent(JOKES.toasterTile);
    await user.click(screen.getByRole('button', { name: 'OK' }));

    // ...and clearing every pop-up lets the next click through.
    let closeButtons = screen.getAllByRole('button', { name: 'Close popup' });
    while (closeButtons.length > 0) {
      await user.click(closeButtons[0]);
      closeButtons = screen.queryAllByRole('button', { name: 'Close popup' });
    }

    await user.click(screen.getAllByRole('button', { name: /Toaster/ })[0]);
    expect(
      screen.getByRole('dialog', { name: OBJECTIVES[2].doneTitle }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next task' }));

    // Task 4 — spam floods everything; the shield program sweeps it away.
    expect(screen.getAllByRole('button', { name: 'Close popup' })).toHaveLength(
      9,
    );
    await user.dblClick(screen.getByRole('button', { name: 'Virus Shield' }));
    const scanner = screen.getByRole('region', { name: 'Virus Shield' });
    await user.click(within(scanner).getByRole('button', { name: 'Scan' }));
    expect(within(scanner).getByText(/Scanning C:/)).toBeInTheDocument();

    expect(
      await screen.findByText(
        '1 threat quarantined: toaster_7_install.exe',
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole(
        'dialog',
        { name: OBJECTIVES[3].doneTitle },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryAllByRole('button', { name: 'Close popup' }),
    ).toHaveLength(0);

    // Play again puts the whole evening back to its blank, quiet start.
    await user.click(screen.getByRole('button', { name: 'Play again' }));
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    expect(
      screen.queryAllByRole('button', { name: 'Close popup' }),
    ).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent(GRANDMA_LINES.intro);
  }, 30000);
});
