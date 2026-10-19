import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JOKES } from 'src/data/gameContent';
import { firePointer } from 'src/tests/firePointer';

import { BrowserWindow } from '.';

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

const onFocus = vi.fn();
const onMove = vi.fn();
const onJoke = vi.fn();

function renderWindow(isFront: boolean) {
  return render(
    <BrowserWindow
      windowId="inbox"
      title="Test Window"
      icon="windows_icons_32x32/mail.png"
      url="http://example.test/page"
      position={{ x: 100, y: 50 }}
      isFront={isFront}
      zIndex={10}
      onFocus={onFocus}
      onMove={onMove}
      onJoke={onJoke}
    >
      <p>Window body</p>
    </BrowserWindow>,
  );
}

describe('BrowserWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title bar, browser chrome, and body', () => {
    renderWindow(true);

    expect(
      screen.getByRole('region', { name: 'Test Window' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Test Window' }),
    ).toBeInTheDocument();
    expect(screen.getByText('http://example.test/page')).toBeInTheDocument();
    expect(screen.getByText('Window body')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Minimize Test Window' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Maximize Test Window' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close Test Window' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Back in Test Window' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Forward in Test Window' }),
    ).toBeInTheDocument();
  });

  it('draws an inactive title bar when the window is behind', () => {
    const inactive = renderWindow(false);
    expect(
      inactive.container.querySelector('.win-titlebar-inactive'),
    ).not.toBeNull();

    const active = renderWindow(true);
    expect(active.container.querySelector('.win-titlebar-inactive')).toBeNull();
    expect(active.container.querySelector('.win-titlebar')).not.toBeNull();
  });

  it('raises the window on pointerdown and on title click', async () => {
    const user = userEvent.setup();
    renderWindow(false);

    await user.click(screen.getByRole('button', { name: 'Test Window' }));
    expect(onFocus).toHaveBeenCalledWith('inbox');

    firePointer(screen.getByText('http://example.test/page'), 'pointerdown');
    expect(onFocus).toHaveBeenCalledWith('inbox');
    expect(play).toHaveBeenCalledWith('click');
  });

  it('tells jokes from the decorative chrome buttons', async () => {
    const user = userEvent.setup();
    renderWindow(true);

    await user.click(
      screen.getByRole('button', { name: 'Minimize Test Window' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.minimize);

    await user.click(
      screen.getByRole('button', { name: 'Maximize Test Window' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.maximize);

    await user.click(screen.getByRole('button', { name: 'Close Test Window' }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.windowClose);

    await user.click(
      screen.getByRole('button', { name: 'Back in Test Window' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.goBack);

    await user.click(
      screen.getByRole('button', { name: 'Forward in Test Window' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.goForward);
  });

  it('drags by the title bar, clamped to the viewport', () => {
    renderWindow(true);
    const titleButton = screen.getByRole('button', { name: 'Test Window' });

    firePointer(titleButton, 'pointerdown', { clientX: 100, clientY: 50 });
    firePointer(window, 'pointermove', { clientX: 300, clientY: 200 });
    expect(onMove).toHaveBeenLastCalledWith('inbox', { x: 300, y: 200 });

    firePointer(window, 'pointermove', { clientX: 9999, clientY: -50 });
    expect(onMove).toHaveBeenLastCalledWith('inbox', { x: 874, y: 0 });
    expect(onFocus).toHaveBeenCalledWith('inbox');

    firePointer(window, 'pointerup');
  });

  it('stops dragging once the pointer is released', () => {
    renderWindow(true);
    const titleButton = screen.getByRole('button', { name: 'Test Window' });

    firePointer(titleButton, 'pointerdown', { clientX: 100, clientY: 50 });
    firePointer(window, 'pointerup');
    firePointer(window, 'pointermove', { clientX: 300, clientY: 200 });

    expect(onMove).not.toHaveBeenCalled();
  });
});
