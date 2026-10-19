import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { firePointer } from 'src/tests/firePointer';
import type { IconWindowConfig } from 'src/types/game';

import { IconWindow } from '.';

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
  },
}));

const listConfig: IconWindowConfig = {
  id: 'computer',
  title: 'My Computer',
  kind: 'list',
  rows: [
    { label: '3½ Floppy (A:)' },
    {
      icon: 'windows_icons_32x32/drive.png',
      label: 'Hard disk (C:)',
      hint: '2.1 GB',
    },
  ],
};

const onFocus = vi.fn();
const onMove = vi.fn();
const onClose = vi.fn();

function renderIconWindow(config: IconWindowConfig = listConfig) {
  return render(
    <IconWindow
      config={config}
      position={{ x: 150, y: 100 }}
      zIndex={15}
      onFocus={onFocus}
      onMove={onMove}
      onClose={onClose}
    />,
  );
}

describe('IconWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a titled mini-window with a list of rows', () => {
    renderIconWindow();

    expect(
      screen.getByRole('region', { name: 'My Computer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('3½ Floppy (A:)')).toBeInTheDocument();
    expect(screen.getByText('Hard disk (C:)')).toBeInTheDocument();
    expect(screen.getByText('2.1 GB')).toBeInTheDocument();
  });

  it('renders the sticky note contents', () => {
    renderIconWindow({
      id: 'notes',
      title: 'Sticky Notes',
      kind: 'note',
      lines: ['THE PASSWORD', '(it’s on the other note)'],
    });

    expect(screen.getByText('THE PASSWORD')).toBeInTheDocument();
    expect(screen.getByText('(it’s on the other note)')).toBeInTheDocument();
  });

  it('accepts digits but every equals shows 47', async () => {
    const user = userEvent.setup();
    renderIconWindow({
      id: 'calculator',
      title: 'Calculator',
      kind: 'calculator',
    });

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('12');

    await user.click(screen.getByRole('button', { name: '=' }));
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('47');

    await user.click(screen.getByRole('button', { name: 'C' }));
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('0');
  });

  it('closes through the title-bar ×', async () => {
    const user = userEvent.setup();
    renderIconWindow();

    await user.click(screen.getByRole('button', { name: 'Close My Computer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('raises on pointerdown with a click tick', () => {
    renderIconWindow();

    firePointer(
      screen.getByRole('region', { name: 'My Computer' }),
      'pointerdown',
    );

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith('click');
  });

  it('drags by the title bar, clamped to the viewport', () => {
    renderIconWindow();

    firePointer(screen.getByText('My Computer'), 'pointerdown', {
      clientX: 150,
      clientY: 100,
    });
    firePointer(window, 'pointermove', { clientX: 250, clientY: 160 });
    expect(onMove).toHaveBeenLastCalledWith({ x: 250, y: 160 });

    firePointer(window, 'pointermove', { clientX: 9999, clientY: -50 });
    expect(onMove).toHaveBeenLastCalledWith({ x: 874, y: 0 });

    firePointer(window, 'pointerup');
  });

  it('stops dragging once the pointer is released', () => {
    renderIconWindow();

    firePointer(screen.getByText('My Computer'), 'pointerdown', {
      clientX: 150,
      clientY: 100,
    });
    firePointer(window, 'pointerup');
    firePointer(window, 'pointermove', { clientX: 300, clientY: 200 });

    expect(onMove).not.toHaveBeenCalled();
  });
});
