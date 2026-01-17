export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
  active: boolean;
};

const API_URL = "http://localhost:4000";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
