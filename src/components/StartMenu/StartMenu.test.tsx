import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { START_ITEMS } from 'src/data/gameContent';

import { StartMenu } from '.';

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

const onSelect = vi.fn();
const onDismiss = vi.fn();

function renderMenu() {
  render(
    <>
      {/* The taskbar's Start button: the outside-press handler spares it. */}
      <button type="button" data-start-toggle="">
        Start
      </button>
      <StartMenu
        items={START_ITEMS}
        onSelect={onSelect}
        onDismiss={onDismiss}
      />
    </>,
  );
}

describe('StartMenu component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders every start menu item with the flyouts down', () => {
    renderMenu();

    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();
    START_ITEMS.forEach((item) => {
      const button = screen.getByRole('menuitem', { name: item.label });
      // Win95's flyout marker: only cascading rows carry the triangle.
      const marker = button.querySelector('span[aria-hidden="true"]');

      if ('children' in item) {
        expect(marker).not.toBeNull();
      } else {
        expect(marker).toBeNull();
      }
    });
    expect(screen.queryByRole('menu', { name: 'Programs submenu' })).toBeNull();
  });

  it('reports the picked item', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Help' }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'help' }),
    );
    expect(play).toHaveBeenCalledWith('click');
  });

  it('opens a flyout on hover, keeps it on a second click, and focuses the first entry', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.hover(screen.getByRole('menuitem', { name: 'Programs' }));
    const flyout = screen.getByRole('menu', { name: 'Programs submenu' });
    expect(
      within(flyout).getByRole('menuitem', { name: 'Steam' }),
    ).toBeInTheDocument();
    expect(
      within(flyout).getByRole('menuitem', { name: 'Solitaire' }),
    ).toHaveFocus();

    const programs = screen.getByRole('menuitem', { name: 'Programs' });
    expect(programs).toHaveAttribute('aria-haspopup', 'menu');
    expect(programs).toHaveAttribute('aria-expanded', 'true');

    // A second press on the parent leaves the flyout up: tap gestures fire
    // pointerenter and click both, and they agree instead of toggling.
    await user.click(programs);
    expect(
      screen.getByRole('menu', { name: 'Programs submenu' }),
    ).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('switches flyouts between parents and puts them away over a flat item', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.hover(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(
      screen.getByRole('menu', { name: 'Settings submenu' }),
    ).toBeInTheDocument();

    await user.hover(screen.getByRole('menuitem', { name: 'Find' }));
    expect(screen.queryByRole('menu', { name: 'Settings submenu' })).toBeNull();
    expect(
      screen.getByRole('menu', { name: 'Find submenu' }),
    ).toBeInTheDocument();

    await user.hover(screen.getByRole('menuitem', { name: 'Run...' }));
    expect(screen.queryByRole('menu', { name: 'Find submenu' })).toBeNull();
    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();
  });

  it('hands a leaf pick to onSelect and takes the flyout down', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));
    await user.click(screen.getByRole('menuitem', { name: 'Steam' }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'steam' }),
    );
    expect(play).toHaveBeenLastCalledWith('click');
    expect(screen.queryByRole('menu', { name: 'Programs submenu' })).toBeNull();
    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();
  });

  it('peels Escape back to the parent and only then dismisses the menu', async () => {
    const user = userEvent.setup();
    renderMenu();

    // A stray key is not Escape: nothing peels, nothing dismisses.
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onDismiss).not.toHaveBeenCalled();

    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));
    const programs = screen.getByRole('menuitem', { name: 'Programs' });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu', { name: 'Programs submenu' })).toBeNull();
    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();
    expect(programs).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('takes the menu down on an outside press but not on its own entries', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));

    // Presses on the flyout itself and on the menu's own frame stay put...
    fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Steam' }));
    expect(
      screen.getByRole('menu', { name: 'Programs submenu' }),
    ).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByRole('menu', { name: 'Start menu' }));
    expect(
      screen.getByRole('menu', { name: 'Programs submenu' }),
    ).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();

    // ...while a press anywhere outside dismisses the whole menu. The frame
    // stays up here because closing it is the parent's job: onDismiss.
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu', { name: 'Programs submenu' })).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('spares the Start button so its own click keeps toggling the menu', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Start' }));

    // No dismiss on pointerdown: the button's click handles closing on its
    // own, and a press here must not race it open again.
    expect(
      screen.getByRole('menu', { name: 'Programs submenu' }),
    ).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
