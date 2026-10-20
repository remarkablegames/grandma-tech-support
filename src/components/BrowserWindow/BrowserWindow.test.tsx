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
const onMinimize = vi.fn();
const onToggleMaximize = vi.fn();
const onClose = vi.fn();
const onJoke = vi.fn();

function renderWindow(isFront: boolean, maximized = false) {
  return render(
    <BrowserWindow
      windowId="inbox"
      title="Test Window"
      icon="windows_icons_32x32/mail.png"
      url="http://example.test/page"
      position={{ x: 100, y: 50 }}
      isFront={isFront}
      maximized={maximized}
      zIndex={10}
      onFocus={onFocus}
      onMove={onMove}
      onMinimize={onMinimize}
      onToggleMaximize={onToggleMaximize}
      onClose={onClose}
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

  it('closes for real from the title bar', async () => {
    const user = userEvent.setup();
    renderWindow(true);

    await user.click(screen.getByRole('button', { name: 'Close Test Window' }));

    expect(onClose).toHaveBeenCalledWith('inbox');
    expect(onJoke).not.toHaveBeenCalled();
  });

  it('tells jokes from the decorative back and forward buttons', async () => {
    const user = userEvent.setup();
    renderWindow(true);

    await user.click(
      screen.getByRole('button', { name: 'Back in Test Window' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.goBack);

    await user.click(
      screen.getByRole('button', { name: 'Forward in Test Window' }),
    );
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.goForward);
  });

  it('minimizes from the title bar', async () => {
    const user = userEvent.setup();
    renderWindow(true);

    await user.click(
      screen.getByRole('button', { name: 'Minimize Test Window' }),
    );

    expect(onMinimize).toHaveBeenCalledWith('inbox');
    expect(onJoke).not.toHaveBeenCalled();
  });

  it('maximizes from the title bar', async () => {
    const user = userEvent.setup();
    renderWindow(true);

    await user.click(
      screen.getByRole('button', { name: 'Maximize Test Window' }),
    );

    expect(onToggleMaximize).toHaveBeenCalledWith('inbox');
    expect(onJoke).not.toHaveBeenCalled();
  });

  it('becomes a restore button when maximized', async () => {
    const user = userEvent.setup();
    renderWindow(true, true);

    const restore = screen.getByRole('button', { name: 'Restore Test Window' });
    expect(restore).toHaveTextContent('▣');

    await user.click(restore);

    expect(onToggleMaximize).toHaveBeenCalledWith('inbox');
  });

  it('fills the desktop above the taskbar when maximized', () => {
    renderWindow(true, true);

    const frame = screen.getByRole('region', { name: 'Test Window' });
    expect(frame.className).toContain('inset-x-0');
    expect(frame.className).toContain('top-0');
    expect(frame.className).toContain('bottom-10');
    expect(frame.className).not.toContain('w-[min(92vw,440px)]');
    expect(frame.style.left).toBe('');
    expect(frame.style.top).toBe('');
    expect(frame.style.zIndex).toBe('10');
    expect(screen.getByText('Window body').parentElement).toHaveClass('flex-1');
  });

  it('does not drag while maximized', () => {
    renderWindow(true, true);
    const titleButton = screen.getByRole('button', { name: 'Test Window' });

    firePointer(titleButton, 'pointerdown', { clientX: 100, clientY: 50 });
    firePointer(window, 'pointermove', { clientX: 300, clientY: 200 });

    expect(onMove).not.toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalledWith('inbox');
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
