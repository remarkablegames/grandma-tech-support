import { PRODUCTS } from 'src/data/gameContent';

interface ShoppingWindowProps {
  onJoke: (joke: string) => void;
}

export function ShoppingWindow({ onJoke }: ShoppingWindowProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#fffbe6] p-2 text-xs text-black">
      <p
        aria-hidden="true"
        className="animate-blink text-win-alert mb-2 text-center text-base font-bold"
      >
        🔥 MEGA SALE — EVERYTHING MUST GO 🔥
      </p>

      <div className="grid grid-cols-3 gap-2">
        {PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => {
              onJoke(product.joke);
            }}
            className="win-button flex flex-col items-center gap-1 p-2 text-center text-black"
          >
            <span aria-hidden="true" className="text-2xl">
              🍞
            </span>
            <span className="font-bold">{product.name}</span>
            <span className="text-win-alert font-bold">{product.price}</span>
          </button>
        ))}
      </div>

      <div className="win-inset mt-3 bg-white px-2 py-1 text-center">
        You are visitor #1,000,000 —Congratulations!
      </div>

      <p className="text-win-shadow mt-2 text-center text-[10px]">
        *Free with purchase of seven other toasters. Shipping not included.
      </p>
    </div>
  );
}
