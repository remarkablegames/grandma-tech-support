import { useState } from 'react';
import { GRANDMA_LINES } from 'src/data/gameContent';
import { useDoubleClickOpen } from 'src/hooks/useDoubleClickOpen';
import { audio } from 'src/services/audio';
import type { EmailConfig } from 'src/types/game';

interface InboxWindowProps {
  loggedIn: boolean;
  emails: EmailConfig[];
  selectedEmail: string | null;
  onLogin: (password: string) => boolean;
  onSelect: (id: string) => void;
  onOpen: (email: EmailConfig) => void;
  onDelete: (id: string) => void;
}

// A row of mail: one click selects it (Win95 list style), a quick second
// click or Enter opens it, and Delete on the focused row takes it out.
function InboxRow({
  email,
  selected,
  onSelect,
  onOpen,
  onDelete,
}: {
  email: EmailConfig;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (email: EmailConfig) => void;
  onDelete: (id: string) => void;
}) {
  const handleOpen = useDoubleClickOpen(() => {
    onOpen(email);
  });

  return (
    <li className="border-b border-[#e5e5e5]">
      <button
        type="button"
        aria-pressed={selected}
        onClick={(event) => {
          onSelect(email.id);
          handleOpen(event);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Delete') {
            event.preventDefault();
            onDelete(email.id);
          }
        }}
        className={`flex w-full items-baseline gap-2 px-2 py-1.5 text-left ${
          selected
            ? 'bg-win-navy text-white'
            : 'hover:bg-win-navy hover:text-white'
        }`}
      >
        <span className="w-24 shrink-0 truncate font-bold">{email.from}</span>
        <span className="truncate">{email.subject}</span>
        <span className="ml-auto shrink-0 text-[10px]">{email.date}</span>
      </button>
    </li>
  );
}

export function InboxWindow({
  loggedIn,
  emails,
  selectedEmail,
  onLogin,
  onSelect,
  onOpen,
  onDelete,
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
        role="toolbar"
        aria-label="Mail actions"
        className="border-win-shadow bg-win-face flex items-center gap-1.5 border-b px-1 py-0.5"
      >
        <button
          type="button"
          disabled={selectedEmail === null}
          onClick={
            selectedEmail === null
              ? undefined
              : () => {
                  audio.play('click');
                  onDelete(selectedEmail);
                }
          }
          className="win-button disabled:text-win-shadow px-2 py-0.5 text-[11px] text-black"
        >
          Delete
        </button>
        <span aria-hidden="true" className="text-win-shadow px-1 text-[11px]">
          Reply
        </span>
        <span aria-hidden="true" className="text-win-shadow px-1 text-[11px]">
          Forward
        </span>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {emails.map((email) => (
          <InboxRow
            key={email.id}
            email={email}
            selected={selectedEmail === email.id}
            onSelect={onSelect}
            onOpen={onOpen}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
