import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { Product } from "../lib/api";

type CartItem = {
  productId: string;
  name: string;
  unitPriceCents: number;
  currency: string;
  quantity: number;
  imageUrl?: string | null;
};

type State = { items: CartItem[] };

type Action =
  | { type: "HYDRATE"; state: State }
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" };

const STORAGE_KEY = "stripe-clone-cart-v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD": {
      const existing = state.items.find((i) => i.productId === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId: action.product.id,
            name: action.product.name,
            unitPriceCents: action.product.priceCents,
            currency: action.product.currency,
            quantity: 1,
            imageUrl: action.product.imageUrl,
          },
        ],
      };
    }

    case "REMOVE":
      return { items: state.items.filter((i) => i.productId !== action.productId) };

    case "SET_QTY":
      return {
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.max(1, Math.min(99, action.quantity)) }
            : i
        ),
      };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

const CartCtx = createContext<{
  items: CartItem[];
  totalItems: number;
  subtotalCents: number;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);
  // load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
    try {
      dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    } catch {
      // ignore
    }}
     setHydrated(true);
  }, []);

  // persist
useEffect(() => {
  if (!hydrated) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}, [state, hydrated]);


  const subtotalCents = useMemo(
    () => state.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
    [state.items]
  );

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const value = {
    items: state.items,
    totalItems,
    subtotalCents,
    add: (p: Product) => dispatch({ type: "ADD", product: p }),
    remove: (id: string) => dispatch({ type: "REMOVE", productId: id }),
    setQty: (id: string, qty: number) => dispatch({ type: "SET_QTY", productId: id, quantity: qty }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
