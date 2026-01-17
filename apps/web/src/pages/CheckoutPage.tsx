import { useState } from "react";
import { useCart } from "../cart/CartContext";

export default function CheckoutPage() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "GB",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://localhost:4000/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        address: {
          name: form.name,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          postcode: form.postcode,
          country: form.country,
        },
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div className="max-w-xl rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold">Checkout</h1>

      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input className="w-full border p-2" placeholder="Email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

        <input className="w-full border p-2" placeholder="Full name"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        <input className="w-full border p-2" placeholder="Address line 1"
          value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })} />

        <input className="w-full border p-2" placeholder="City"
          value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />

        <input className="w-full border p-2" placeholder="Postcode"
          value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} />

        <button disabled={loading} className="w-full bg-black p-2 text-white">
          {loading ? "Redirecting…" : "Pay with Stripe"}
        </button>
      </form>
    </div>
  );
}
