import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from "react";
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
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" };

const STORAGE_KEY = "stripe-clone-cart-v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
        items: state.items
          .map((i) =>
            i.productId === action.productId
              ? { ...i, quantity: Math.max(1, Math.min(99, action.quantity)) }
              : i
          )
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
  // ✅ Lazy init: hydrate synchronously from localStorage (no race condition)
  const [state, dispatch] = useReducer(
    reducer,
    { items: [] },
    (initial) => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initial;
      try {
        return JSON.parse(raw) as State;
      } catch {
        return initial;
      }
    }
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ✅ Derived values
  const subtotalCents = useMemo(
    () => state.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
    [state.items]
  );

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  // ✅ Stable callbacks (prevents useEffect loops like Maximum update depth exceeded)
  const add = useCallback((p: Product) => dispatch({ type: "ADD", product: p }), []);
  const remove = useCallback((id: string) => dispatch({ type: "REMOVE", productId: id }), []);
  const setQty = useCallback(
    (id: string, qty: number) => dispatch({ type: "SET_QTY", productId: id, quantity: qty }),
    []
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo(
    () => ({
      items: state.items,
      totalItems,
      subtotalCents,
      add,
      remove,
      setQty,
      clear,
    }),
    [state.items, totalItems, subtotalCents, add, remove, setQty, clear]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
