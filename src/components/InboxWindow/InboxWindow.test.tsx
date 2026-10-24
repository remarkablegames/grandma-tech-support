import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EMAILS, GRANDMA_LINES, JOKES } from 'src/data/gameContent';

import { InboxWindow } from '.';

vi.mock('src/services/audio', () => ({
  audio: {
    play: vi.fn(),
    getVolume: () => 100,
    isMuted: () => false,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

const onLogin = vi.fn(() => true);
const onSelect = vi.fn();
const onOpen = vi.fn();
const onDelete = vi.fn();

function renderInbox(
  loggedIn: boolean,
  emails: typeof EMAILS = EMAILS,
  selectedEmail: string | null = null,
) {
  return render(
    <InboxWindow
      loggedIn={loggedIn}
      emails={emails}
      selectedEmail={selectedEmail}
      onLogin={onLogin}
      onSelect={onSelect}
      onOpen={onOpen}
      onDelete={onDelete}
    />,
  );
}

describe('InboxWindow component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('asks for the password before showing any email', () => {
    renderInbox(false);

    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /The Grandkids/ })).toBeNull();
  });

  it('flags a wrong password with grandma’s hint', async () => {
    const user = userEvent.setup();
    onLogin.mockReturnValueOnce(false);
    renderInbox(false);

    await user.type(screen.getByLabelText('Password'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(onLogin).toHaveBeenCalledWith('nope');
    expect(screen.getByRole('alert')).toHaveTextContent(
      GRANDMA_LINES.wrongPassword,
    );
  });

  it('clears the hint as soon as typing resumes', async () => {
    const user = userEvent.setup();
    onLogin.mockReturnValueOnce(false);
    renderInbox(false);

    await user.type(screen.getByLabelText('Password'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Password'), ' again');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('submits the typed password with Enter', async () => {
    const user = userEvent.setup();
    renderInbox(false);

    await user.type(screen.getByLabelText('Password'), 'password{Enter}');

    expect(onLogin).toHaveBeenCalledWith('password');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('lists the emails once logged in', () => {
    renderInbox(true);

    expect(
      screen.getByRole('button', { name: /The Grandkids/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /photos of the dog/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Important!!/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /toaster awaits/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send \$500/ }),
    ).toBeInTheDocument();
  });

  it('selects a row on a single click and opens it on a double click', async () => {
    const user = userEvent.setup();
    renderInbox(true);

    const row = screen.getByRole('button', { name: /photos of the dog/ });
    await user.click(row);
    expect(onSelect).toHaveBeenLastCalledWith('dog');
    expect(onOpen).not.toHaveBeenCalled();

    await user.dblClick(row);
    expect(onOpen).toHaveBeenCalled();
    expect(onOpen.mock.calls.at(-1)?.[0]).toMatchObject({ id: 'dog' });
  });

  it('opens the target email on a double click', async () => {
    const user = userEvent.setup();
    renderInbox(true);

    await user.dblClick(screen.getByRole('button', { name: /The Grandkids/ }));
    expect(onOpen).toHaveBeenCalled();
    expect(onOpen.mock.calls.at(-1)?.[0]).toMatchObject({ id: 'joke' });
  });

  it('jokes about the decoy emails when they are opened', async () => {
    const user = userEvent.setup();
    renderInbox(true);

    const cases = [
      { name: /photos of the dog/, id: 'dog', joke: JOKES.emailDog },
      { name: /Important!!/, id: 'update', joke: JOKES.emailUpdate },
      { name: /toaster awaits/, id: 'prize', joke: JOKES.emailPrize },
      { name: /send \$500/, id: 'wire', joke: JOKES.emailWire },
      { name: /FW: FW: FW:/, id: 'chain', joke: JOKES.emailChain },
      { name: /Scorpio/, id: 'horoscope', joke: JOKES.emailHoroscope },
      { name: /weird trick/, id: 'vitamins', joke: JOKES.emailVitamins },
      { name: /free trial/, id: 'trial', joke: JOKES.emailTrial },
      { name: /1,000 toasters/, id: 'cart', joke: JOKES.emailCart },
    ];

    for (const entry of cases) {
      await user.dblClick(screen.getByRole('button', { name: entry.name }));
      expect(onOpen.mock.calls.at(-1)?.[0]).toMatchObject({ id: entry.id });
    }
  });

  it('marks the selected row and disables Delete without a selection', () => {
    renderInbox(true, EMAILS, null);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('enables Delete for a selected row and deletes it', async () => {
    const user = userEvent.setup();
    renderInbox(true, EMAILS, 'dog');

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toBeDisabled();

    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('dog');
  });

  it('deletes the focused row with the Delete key', async () => {
    const user = userEvent.setup();
    renderInbox(true, EMAILS, 'dog');

    const row = screen.getByRole('button', { name: /photos of the dog/ });
    row.focus();
    await user.keyboard('{Delete}');

    expect(onDelete).toHaveBeenCalledWith('dog');
  });

  it('ignores other keys on a focused row', async () => {
    const user = userEvent.setup();
    renderInbox(true, EMAILS, 'dog');

    const row = screen.getByRole('button', { name: /photos of the dog/ });
    row.focus();
    await user.keyboard('x');

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('reflects the selected row in aria-pressed', () => {
    renderInbox(true, EMAILS, 'dog');

    expect(
      screen.getByRole('button', { name: /photos of the dog/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
