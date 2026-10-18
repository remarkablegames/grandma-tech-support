import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { START_ITEMS } from 'src/data/gameContent';

import { StartMenu } from '.';

const onSelect = vi.fn();

describe('StartMenu component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders every start menu item', () => {
    render(<StartMenu items={START_ITEMS} onSelect={onSelect} />);

    expect(
      screen.getByRole('menu', { name: 'Start menu' }),
    ).toBeInTheDocument();
    START_ITEMS.forEach((item) => {
      expect(
        screen.getByRole('menuitem', { name: item.label }),
      ).toBeInTheDocument();
    });
  });

  it('reports the picked item', async () => {
    const user = userEvent.setup();
    render(<StartMenu items={START_ITEMS} onSelect={onSelect} />);

    await user.click(screen.getByRole('menuitem', { name: 'Help' }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'help' }),
    );
  });
});
