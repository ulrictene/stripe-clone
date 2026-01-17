import { Routes, Route, Navigate, Link } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import { useCart } from "./cart/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";


export default function App() {
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4">

        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/shop" className="font-semibold">
            Stripe Checkout Clone
          </Link>

          <Link to="/cart" className="text-sm">
            Cart ({totalItems})
          </Link>
        </div>
        </div> 
       </header>
       
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/shop" replace />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </main>
    </div>
  );
}


