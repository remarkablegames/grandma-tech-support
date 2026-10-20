import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JOKES } from 'src/data/gameContent';

import { ShoppingWindow } from '.';

vi.mock('src/services/audio', () => ({
  audio: {
    play: vi.fn(),
    getVolume: () => 100,
    isMuted: () => false,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

const onBuy = vi.fn();

describe('ShoppingWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sale page', () => {
    render(<ShoppingWindow onBuy={onBuy} />);

    expect(screen.getByText(/MEGA SALE/)).toBeInTheDocument();
    expect(screen.getByText(/visitor #1,000,000/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Toaster/ })).toHaveLength(3);
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('passes the product joke along when a product is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingWindow onBuy={onBuy} />);

    const firstProduct = screen.getAllByRole('button', { name: /Toaster/ })[0];
    await user.click(firstProduct);

    expect(onBuy).toHaveBeenCalledWith(JOKES.toasterTile);
  });
});
