import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";

type OrderItem = {
  id: string;
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

type Address = {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  postcode: string;
  country: string;
};

type Order = {
  id: string;
  email: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  totalCents: number;
  currency: string;
  items: OrderItem[];
  address?: Address | null;
};

export default function SuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!sessionId) return;
  clear();
}, [sessionId, clear]);




  useEffect(() => {
    if (!sessionId) return;

    (async () => {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/orders/by-session/${sessionId}`);
      const data = await res.json();
      setOrder(data);
      setLoading(false);
    })();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Missing session</h1>
        <Link to="/shop" className="mt-2 inline-block underline">Back to shop</Link>
      </div>
    );
  }

  if (loading) return <div>Loading receipt…</div>;

  if (!order || (order as any).error) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Receipt not found</h1>
        <Link to="/shop" className="mt-2 inline-block underline">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold">Payment successful ✅</h1>
      <div className="mt-1 text-sm text-slate-600">Order {order.id}</div>

      <div className="mt-4 border-t pt-4">
        <div className="text-sm font-medium">Items</div>
        <div className="mt-2 space-y-2">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <div>
                {i.nameSnapshot} × {i.quantity}
              </div>
              <div>£{(i.lineTotalCents / 100).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between font-semibold">
          <div>Total</div>
          <div>£{(order.totalCents / 100).toFixed(2)}</div>
        </div>

        <div className="mt-4 text-sm">
          <div className="font-medium">Status</div>
          <div className="text-slate-600">{order.status}</div>
        </div>

        {order.address && (
          <div className="mt-4 text-sm">
            <div className="font-medium">Shipping</div>
            <div className="text-slate-600">
              {order.address.name}, {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""},{" "}
              {order.address.city}, {order.address.postcode}, {order.address.country}
            </div>
          </div>
        )}

        <Link to="/shop" className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
