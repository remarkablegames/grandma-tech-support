import { PRODUCTS } from 'src/data/gameContent';

interface ShoppingWindowProps {
  onBuy: (joke: string) => void;
}

export function ShoppingWindow({ onBuy }: ShoppingWindowProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#fffbe6] p-2 text-xs text-black">
      <p
        aria-hidden="true"
        className="animate-blink text-win-alert mb-2 text-center text-base font-bold"
      >
        🔥 MEGA SALE — EVERYTHING MUST GO 🔥
      </p>

      <p className="text-win-alert mb-2 text-center text-xs font-bold">
        ⏰ Offer extended! Ends in 04:59
      </p>

      <div className="grid grid-cols-3 gap-2">
        {PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => {
              onBuy(product.joke);
            }}
            className="win-button flex flex-col items-center gap-1 p-2 text-center text-black"
          >
            <span aria-hidden="true" className="text-2xl">
              {product.emoji}
            </span>
            <span className="font-bold">{product.name}</span>
            <span className="text-win-alert font-bold">{product.price}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-center">
        ⭐⭐⭐⭐⭐ “It toasts.” (verified buyer, 2 reviews)
      </p>

      <p className="mt-2 text-center">
        Customers who bought this also bought: black toaster, white toaster,
        toaster insurance
      </p>

      <div className="win-inset mt-3 bg-white px-2 py-1 text-center">
        You’re visitor #1,000,000 — Congratulations!
      </div>

      <p aria-hidden="true" className="mt-2 text-center text-[10px] underline">
        Home | Search | Free Email | Chat Room | Guestbook
      </p>

      <p className="text-win-shadow mt-2 text-center text-[10px]">
        *Free with purchase of seven other toasters. Shipping not included.
      </p>
    </div>
  );
}
