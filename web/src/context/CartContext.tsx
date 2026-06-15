import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(productId: string, size: string, color: string) {
  return `${productId}-${size}-${color}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: string, color: string) => {
    setItems((prev) => {
      const key = itemKey(product.id, size, color);
      const existing = prev.find(
        (i) => itemKey(i.product.id, i.size, i.color) === key
      );
      const stock = product.stock;
      const nextQty = existing ? existing.quantity + 1 : 1;
      if (stock !== undefined && nextQty > stock) return prev;

      if (existing) {
        return prev.map((i) =>
          itemKey(i.product.id, i.size, i.color) === key
            ? { ...i, quantity: nextQty }
            : i
        );
      }
      return [...prev, { product, size, color, quantity: 1 }];
    });
  };

  const removeItem = (productId: string, size: string, color: string) => {
    const key = itemKey(productId, size, color);
    setItems((prev) =>
      prev.filter((i) => itemKey(i.product.id, i.size, i.color) !== key)
    );
  };

  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    if (quantity < 1) {
      removeItem(productId, size, color);
      return;
    }
    const key = itemKey(productId, size, color);
    setItems((prev) =>
      prev.map((i) => {
        if (itemKey(i.product.id, i.size, i.color) !== key) return i;
        const stock = i.product.stock;
        const capped = stock !== undefined ? Math.min(quantity, stock) : quantity;
        return { ...i, quantity: capped };
      })
    );
  };

  const clearCart = () => setItems([]);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      count,
      subtotal,
    }),
    [items, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
