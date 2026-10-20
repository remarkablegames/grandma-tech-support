import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GRANDMA_LINES, JOKES } from 'src/data/gameContent';

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

const onJoke = vi.fn();
const onOpenEmail = vi.fn();
const onLogin = vi.fn(() => true);

function renderInbox(loggedIn: boolean) {
  return render(
    <InboxWindow
      loggedIn={loggedIn}
      onLogin={onLogin}
      onJoke={onJoke}
      onOpenEmail={onOpenEmail}
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

  it('opens the target email', async () => {
    const user = userEvent.setup();
    renderInbox(true);

    await user.click(screen.getByRole('button', { name: /The Grandkids/ }));
    expect(onOpenEmail).toHaveBeenCalledTimes(1);
    expect(onJoke).not.toHaveBeenCalled();
  });

  it('jokes about the decoy emails instead', async () => {
    const user = userEvent.setup();
    renderInbox(true);

    await user.click(screen.getByRole('button', { name: /photos of the dog/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailDog);

    await user.click(screen.getByRole('button', { name: /Important!!/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailUpdate);

    await user.click(screen.getByRole('button', { name: /toaster awaits/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailPrize);

    await user.click(screen.getByRole('button', { name: /send \$500/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailWire);

    await user.click(screen.getByRole('button', { name: /FW: FW: FW:/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailChain);

    await user.click(screen.getByRole('button', { name: /Scorpio/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailHoroscope);

    await user.click(screen.getByRole('button', { name: /weird trick/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailVitamins);

    await user.click(screen.getByRole('button', { name: /free trial/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailTrial);

    await user.click(screen.getByRole('button', { name: /1,000 toasters/ }));
    expect(onJoke).toHaveBeenLastCalledWith(JOKES.emailCart);

    expect(onOpenEmail).not.toHaveBeenCalled();
  });
});
