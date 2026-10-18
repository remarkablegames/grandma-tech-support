import { render, screen } from '@testing-library/react';

import { GrandmaSpeech } from '.';

describe('GrandmaSpeech component', () => {
  it('announces grandma’s line as a live status region', () => {
    render(<GrandmaSpeech line="Find my email, dear." />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Find my email, dear.',
    );
  });
});
