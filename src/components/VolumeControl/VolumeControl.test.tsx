import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VolumeControl } from '.';

const { getVolume, isMuted, setMuted, setVolume } = vi.hoisted(() => ({
  getVolume: vi.fn(() => 100),
  isMuted: vi.fn(() => false),
  setMuted: vi.fn(),
  setVolume: vi.fn(),
}));

vi.mock('src/services/audio', () => ({
  audio: {
    play: vi.fn(),
    getVolume,
    isMuted,
    setVolume,
    setMuted,
  },
}));

describe('VolumeControl component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a collapsed tray speaker button', () => {
    render(<VolumeControl />);

    const button = screen.getByRole('button', { name: 'Volume control' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a Volume Control panel with a Sounds fader and Mute', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);

    await user.click(screen.getByRole('button', { name: 'Volume control' }));

    expect(
      screen.getByRole('dialog', { name: 'Volume Control' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Sounds volume' })).toHaveValue(
      '100',
    );
    expect(screen.getByRole('checkbox', { name: 'Mute' })).not.toBeChecked();
  });

  it('focuses the fader when opened', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);

    await user.click(screen.getByRole('button', { name: 'Volume control' }));

    expect(screen.getByRole('slider', { name: 'Sounds volume' })).toHaveFocus();
  });

  it('closes on Escape and returns focus to the tray button', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);

    const button = screen.getByRole('button', { name: 'Volume control' });
    await user.click(button);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(button).toHaveFocus();
  });

  it('stays open for other keys', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);

    await user.click(screen.getByRole('button', { name: 'Volume control' }));
    await user.keyboard('a');

    expect(
      screen.getByRole('dialog', { name: 'Volume Control' }),
    ).toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);

    await user.click(screen.getByRole('button', { name: 'Volume control' }));
    await user.click(document.body);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('applies fader changes to the audio service', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);
    await user.click(screen.getByRole('button', { name: 'Volume control' }));

    fireEvent.change(screen.getByRole('slider', { name: 'Sounds volume' }), {
      target: { value: '35' },
    });

    expect(setVolume).toHaveBeenCalledWith(35);
    expect(screen.getByRole('slider', { name: 'Sounds volume' })).toHaveValue(
      '35',
    );
  });

  it('mutes and unmutes through the checkbox', async () => {
    const user = userEvent.setup();
    render(<VolumeControl />);
    await user.click(screen.getByRole('button', { name: 'Volume control' }));

    const mute = screen.getByRole('checkbox', { name: 'Mute' });
    await user.click(mute);
    expect(setMuted).toHaveBeenCalledWith(true);

    await user.click(mute);
    expect(setMuted).toHaveBeenCalledWith(false);
  });

  it('reflects a muted start state on the tray button', () => {
    isMuted.mockReturnValueOnce(true);

    render(<VolumeControl />);

    expect(
      screen.getByRole('button', { name: 'Volume control (muted)' }),
    ).toBeInTheDocument();
  });

  it('starts the fader from the stored volume', async () => {
    getVolume.mockReturnValueOnce(60);
    const user = userEvent.setup();
    render(<VolumeControl />);

    await user.click(screen.getByRole('button', { name: 'Volume control' }));

    expect(screen.getByRole('slider', { name: 'Sounds volume' })).toHaveValue(
      '60',
    );
  });
});
