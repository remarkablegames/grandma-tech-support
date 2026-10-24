import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConfirmDialog } from '.';

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
  },
}));

const onConfirm = vi.fn();
const onCancel = vi.fn();

describe('ConfirmDialog component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('asks the Win95 confirm question with Yes autofocused', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to delete these items?"
        icon="windows_icons_32x32/recycle_bin_full.png"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const dialog = screen.getByRole('alertdialog', {
      name: 'Confirm Delete',
    });
    expect(dialog).toHaveTextContent(
      'Are you sure you want to delete these items?',
    );
    expect(dialog.querySelector('img')?.getAttribute('src')).toContain(
      'recycle_bin_full.png',
    );
    expect(screen.getByRole('button', { name: 'Yes' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledWith('click');
  });

  it('hands back to the flow that asked on Yes, graphic optional', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        title="Confirm Delete"
        message="Delete?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const dialog = screen.getByRole('alertdialog', {
      name: 'Confirm Delete',
    });
    expect(dialog.querySelector('img')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledWith('click');
  });
});
