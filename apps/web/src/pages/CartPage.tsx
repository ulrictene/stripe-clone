import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";

export default function CartPage() {
  const { items, subtotalCents, remove, setQty } = useCart();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link to="/shop" className="mt-3 inline-block text-sm underline">
          Go shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-xl border bg-white p-4">
        <h1 className="mb-3 text-xl font-semibold">Cart</h1>

        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-3">
                {i.imageUrl && (
                  <img
                    src={i.imageUrl}
                    alt={i.name}
                    className="h-14 w-14 rounded-md object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-slate-600">
                    £{(i.unitPriceCents / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-16 rounded-md border px-2 py-1 text-sm"
                  type="number"
                  min={1}
                  max={99}
                  value={i.quantity}
                  onChange={(e) => setQty(i.productId, Number(e.target.value))}
                />
                <button
                  className="rounded-md border px-2 py-1 text-sm"
                  onClick={() => remove(i.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-600">Subtotal</div>
        <div className="text-2xl font-semibold">£{(subtotalCents / 100).toFixed(2)}</div>

        <button
          className="mt-4 w-full rounded-lg bg-black px-3 py-2 text-sm text-white"
          onClick={() => nav("/checkout")}
          disabled
          title="Checkout comes Day 5"
        >
          Proceed to checkout
        </button>

        <div className="mt-2 text-xs text-slate-500">
          <button onClick={() => nav("/checkout")} className="mt-4 w-full bg-black p-2 text-white">
          Proceed to checkout
          </button>

        </div>
      </div>
    </div>
  );
}
