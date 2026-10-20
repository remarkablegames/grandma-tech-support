import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POPUP_CONFIGS } from 'src/data/gameContent';
import type { OpenPopup } from 'src/types/game';

import { Popups } from '.';

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

// The game opens blank now, so this component test carries its own pair.
const INITIAL_POPUPS: OpenPopup[] = [
  { key: 'shopping-deal', popupId: 'deal', windowId: 'shopping' },
  { key: 'inbox-full', popupId: 'full', windowId: 'inbox' },
];

const onDismiss = vi.fn();
const onAction = vi.fn();

describe('Popups component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when the window has no popups', () => {
    const { container } = render(
      <Popups
        windowId="inbox"
        popups={[]}
        onDismiss={onDismiss}
        onAction={onAction}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('ignores popups that belong to other windows', () => {
    const { container } = render(
      <Popups
        windowId="virus"
        popups={INITIAL_POPUPS}
        onDismiss={onDismiss}
        onAction={onAction}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows only its own popups and routes their actions', async () => {
    const user = userEvent.setup();
    render(
      <Popups
        windowId="inbox"
        popups={INITIAL_POPUPS}
        onDismiss={onDismiss}
        onAction={onAction}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: 'Your mailbox is FULL' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'CONGRATULATIONS!!!' }),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Close popup' }));
    expect(onDismiss).toHaveBeenCalledWith('inbox-full', 'full');

    await user.click(screen.getByRole('button', { name: 'Fix now!' }));
    expect(onAction).toHaveBeenCalledWith(
      'inbox',
      POPUP_CONFIGS.full.buttons[0],
    );
    expect(play).toHaveBeenCalledWith('error');
  });

  it('plays an open sound when a liar Close spawns popups', async () => {
    const user = userEvent.setup();
    render(
      <Popups
        windowId="inbox"
        popups={INITIAL_POPUPS}
        onDismiss={onDismiss}
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(play).toHaveBeenCalledWith('open');
  });

  it('stacks several popups in one window', () => {
    const popups: OpenPopup[] = [
      ...INITIAL_POPUPS.filter((popup) => popup.windowId === 'inbox'),
      { key: 'spam-1', popupId: 'spam', windowId: 'inbox' },
    ];

    render(
      <Popups
        windowId="inbox"
        popups={popups}
        onDismiss={onDismiss}
        onAction={onAction}
      />,
    );

    expect(screen.getAllByRole('dialog')).toHaveLength(2);
  });
});
