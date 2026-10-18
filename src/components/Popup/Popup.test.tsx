import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POPUP_CONFIGS } from 'src/data/gameContent';

import { Popup } from '.';

const onDismiss = vi.fn();
const onAction = vi.fn();

function renderPopup(offset: number) {
  return render(
    <Popup
      config={POPUP_CONFIGS.deal}
      offset={offset}
      onDismiss={onDismiss}
      onAction={onAction}
    />,
  );
}

describe('Popup component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the popup message and its buttons', () => {
    renderPopup(0);

    expect(
      screen.getByRole('dialog', { name: 'CONGRATULATIONS!!!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1,000,000th visitor/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close popup' }),
    ).toBeInTheDocument();
  });

  it('dismisses through the tiny title-bar X', async () => {
    const user = userEvent.setup();
    renderPopup(0);

    await user.click(screen.getByRole('button', { name: 'Close popup' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('reports which button was pressed', async () => {
    const user = userEvent.setup();
    renderPopup(0);

    await user.click(screen.getByRole('button', { name: 'Buy' }));
    expect(onAction).toHaveBeenCalledWith(POPUP_CONFIGS.deal.buttons[0]);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onAction).toHaveBeenCalledWith(POPUP_CONFIGS.deal.buttons[1]);
  });

  it('cascades when stacked behind another popup', () => {
    renderPopup(1);

    expect(
      screen.getByRole('dialog', { name: 'CONGRATULATIONS!!!' }),
    ).toHaveStyle({ left: '28px', top: '30px', right: '12px' });
  });
});
