import { useState } from 'react';
import { EMAILS, GRANDMA_LINES } from 'src/data/gameContent';

interface InboxWindowProps {
  loggedIn: boolean;
  onLogin: (password: string) => boolean;
  onJoke: (joke: string) => void;
  onOpenEmail: () => void;
}

export function InboxWindow({
  loggedIn,
  onLogin,
  onJoke,
  onOpenEmail,
}: InboxWindowProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!loggedIn) {
    // Grandma's webmail wants a password first; the answer is on her note.
    return (
      <form
        className="flex h-full flex-col items-center justify-center gap-3 bg-white p-4 text-center text-xs text-black"
        onSubmit={(event) => {
          event.preventDefault();

          if (onLogin(password)) {
            setPassword('');
            setError(false);
          } else {
            setError(true);
          }
        }}
      >
        <p className="text-sm font-bold">Grandma’s Mail: Sign In</p>
        <p className="text-[11px]">User name: grandma</p>
        <label className="flex items-center gap-2">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(false);
            }}
            className="win-inset px-2 py-1 text-xs"
          />
        </label>
        {error && (
          <p role="alert" className="text-win-alert font-bold">
            {GRANDMA_LINES.wrongPassword}
          </p>
        )}
        <button type="submit" className="win-button px-4 py-1.5 font-bold">
          Log in
        </button>
      </form>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white text-xs text-black">
      <div
        aria-hidden="true"
        className="border-win-shadow bg-win-face text-win-shadow flex gap-3 border-b px-2 py-1 text-[11px]"
      >
        <span>Delete</span>
        <span>Reply</span>
        <span>Forward</span>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {EMAILS.map((email) => (
          <li key={email.id} className="border-b border-[#e5e5e5]">
            <button
              type="button"
              onClick={() => {
                if (email.target) {
                  onOpenEmail();
                } else {
                  onJoke(email.joke);
                }
              }}
              className="hover:bg-win-navy flex w-full items-baseline gap-2 px-2 py-1.5 text-left hover:text-white"
            >
              <span className="w-24 shrink-0 truncate font-bold">
                {email.from}
              </span>
              <span className="truncate">{email.subject}</span>
              <span className="ml-auto shrink-0 text-[10px]">{email.date}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
