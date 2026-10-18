import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GRANDMA_LINES } from 'src/data/gameContent';

import { WinScreen } from '.';

const onPlayAgain = vi.fn();

describe('WinScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows grandma’s amused thank-you', () => {
    render(<WinScreen onPlayAgain={onPlayAgain} />);

    expect(
      screen.getByRole('dialog', { name: 'You found your email' }),
    ).toBeInTheDocument();
    expect(screen.getByText(GRANDMA_LINES.win)).toBeInTheDocument();
  });

  it('restarts the game', async () => {
    const user = userEvent.setup();
    render(<WinScreen onPlayAgain={onPlayAgain} />);

    await user.click(screen.getByRole('button', { name: 'Play again' }));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
