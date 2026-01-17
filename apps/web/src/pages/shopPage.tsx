import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/api";
import { useCart } from "../cart/CartContext";

export default function ShopPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { add } = useCart();

  if (isLoading) return <div className="p-6 text-sm text-slate-600">Loading products…</div>;
  if (error) return <div className="p-6 text-sm text-red-600">Failed to load products.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Shop</h1>
            <p className="text-sm text-slate-600">Browse products and add to your cart.</p>
          </div>

          {/* placeholder for future search/sort */}
          <div className="flex items-center gap-2">
            <div className="rounded-full border bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
              {data?.length ?? 0} items
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            
              {/* Image */}
              <div className="relative">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                   className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-slate-100 text-xs text-slate-500">
                    No image
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>

              {/* Content */}

              <div className="p-4">
                 <h3 className="text-sm font-semibold text-slate-900">
    {p.name}
  </h3>
                {/* <div className="flex items-start justify-between gap-3">
                 <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{p.name}</div>
                    {p.description && ( */}
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {p.description}
                      </p>
                    {/* )} */}
                  {/* </div> */}

                  {/* <div className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800"> */}
                  <div className="mt-3 text-base font-semibold text-slate-900">
                    £{(p.priceCents / 100).toFixed(2)}
                  </div>
                </div>

              
                <button
                 onClick={() => add(p)}
                 className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white
                 hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                 >
                Add to cart
                </button>

              </div>

            //   {/* hover ring */}
            //   <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-slate-900/10" />
            // </div>
          ))}
        </div>
      </div>
    </div>
  );
}

