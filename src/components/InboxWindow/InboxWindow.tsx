import { EMAILS } from 'src/data/gameContent';

interface InboxWindowProps {
  onJoke: (joke: string) => void;
  onOpenEmail: () => void;
}

export function InboxWindow({ onJoke, onOpenEmail }: InboxWindowProps) {
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
