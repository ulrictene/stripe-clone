import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/api";

export default function ShopPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div>Loading products…</div>;
  if (error) return <div className="text-red-600">Failed to load products.</div>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Shop</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data!.map((p) => (
          <div key={p.id} className="rounded-xl border bg-white p-4 shadow-sm">
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="mb-3 h-40 w-full rounded-lg object-cover"
              />
            )}

            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-slate-600">{p.description}</div>

            <div className="mt-2 text-sm font-semibold">
              £{(p.priceCents / 100).toFixed(2)}
            </div>

            <button
              className="mt-3 w-full rounded-lg bg-black px-3 py-2 text-sm text-white"
              onClick={() => alert("Cart comes on Day 4")}
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
