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

const onJoke = vi.fn();

describe('ShoppingWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sale page', () => {
    render(<ShoppingWindow onJoke={onJoke} />);

    expect(screen.getByText(/MEGA SALE/)).toBeInTheDocument();
    expect(screen.getByText(/visitor #1,000,000/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Toaster/ })).toHaveLength(3);
  });

  it('tells a toaster joke when a product is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingWindow onJoke={onJoke} />);

    const firstProduct = screen.getAllByRole('button', { name: /Toaster/ })[0];
    await user.click(firstProduct);

    expect(onJoke).toHaveBeenCalledWith(JOKES.toasterTile);
  });
});
