"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
};

const keyOf = (productId: string, variantId: string | null) =>
  `${productId}:${variantId ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const key = keyOf(item.productId, item.variantId);
          const existing = state.items.find(
            (i) => keyOf(i.productId, i.variantId) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                keyOf(i.productId, i.variantId) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => keyOf(i.productId, i.variantId) !== keyOf(productId, variantId)
          ),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => keyOf(i.productId, i.variantId) !== keyOf(productId, variantId)
                )
              : state.items.map((i) =>
                  keyOf(i.productId, i.variantId) === keyOf(productId, variantId)
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "joyeria-cart" }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}
