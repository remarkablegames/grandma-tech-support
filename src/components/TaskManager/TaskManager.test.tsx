import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WINDOW_META } from 'src/data/gameContent';
import type { WindowId, WindowMeta } from 'src/types/game';

import { TaskManager } from '.';

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

const onEndTask = vi.fn();
const onShutDown = vi.fn();
const onCancel = vi.fn();

const FROZEN: Record<WindowId, boolean> = {
  shopping: true,
  inbox: false,
  virus: false,
};

function renderDialog(windows: WindowMeta[] = WINDOW_META) {
  return render(
    <TaskManager
      windows={windows}
      frozen={FROZEN}
      onEndTask={onEndTask}
      onShutDown={onShutDown}
      onCancel={onCancel}
    />,
  );
}

describe('TaskManager component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists every open window, tagging the frozen one', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Task Manager' });
    expect(
      within(dialog).getByRole('button', {
        name: `${WINDOW_META[0].title} (Not responding)`,
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: WINDOW_META[1].title }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: WINDOW_META[2].title }),
    ).toBeInTheDocument();

    // Nothing selected: End Task has nothing to end.
    expect(screen.getByRole('button', { name: 'End Task' })).toBeDisabled();
  });

  it('ends the selected window only', async () => {
    const user = userEvent.setup();
    renderDialog();

    const row = screen.getByRole('button', { name: WINDOW_META[1].title });
    await user.click(row);
    expect(row).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'End Task' }));
    expect(onEndTask).toHaveBeenCalledTimes(1);
    expect(onEndTask).toHaveBeenCalledWith('inbox');
    expect(onShutDown).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('routes Shut Down and Cancel to their own fates', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Shut Down' }));
    expect(onShutDown).toHaveBeenCalledTimes(1);
    expect(onEndTask).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onEndTask).not.toHaveBeenCalled();
  });
});
