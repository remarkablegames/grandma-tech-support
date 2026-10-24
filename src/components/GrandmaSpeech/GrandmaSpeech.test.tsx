import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GrandmaSpeech } from '.';

function renderSpeech(onRepeat: () => void) {
  render(<GrandmaSpeech line="Find my email, dear." onRepeat={onRepeat} />);
}

describe('GrandmaSpeech component', () => {
  it('announces grandma’s line as a live status region', () => {
    renderSpeech(vi.fn());

    expect(screen.getByRole('status')).toHaveTextContent(
      'Find my email, dear.',
    );
  });

  it('re-speaks the task when the bubble is clicked', async () => {
    const user = userEvent.setup();
    const onRepeat = vi.fn();
    renderSpeech(onRepeat);

    await user.click(screen.getByRole('button'));

    expect(onRepeat).toHaveBeenCalledTimes(1);
  });

  it('re-speaks the task from the keyboard too', async () => {
    const user = userEvent.setup();
    const onRepeat = vi.fn();
    renderSpeech(onRepeat);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onRepeat).toHaveBeenCalledTimes(1);
  });

  it('hints that the bubble repeats the task, for screen readers', () => {
    renderSpeech(vi.fn());

    expect(screen.getByRole('button')).toHaveAccessibleName(
      /click grandma to hear it again/,
    );
  });
});
