import { Routes, Route, Navigate, Link } from "react-router-dom";
import ShopPage from "./pages/shopPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/shop" className="font-semibold">
            Stripe Checkout Clone
          </Link>
          <div className="text-sm text-slate-600">Products</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/shop" replace />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </main>
    </div>
  );
}

