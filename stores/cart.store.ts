'use client';

/**
 * Store del carrito — Zustand (sin persist, se sincroniza con la API).
 *
 * Dos capas:
 * 1. Estado local (Zustand): respuesta inmediata al usuario
 * 2. API: persistencia y fuente de verdad
 *
 * En Flutter esto sería un ChangeNotifier o Riverpod StateNotifier.
 */
import { create } from 'zustand';
import type { Cart } from '@/lib/types';

interface CartState {
  cart: Cart | null;
  isOpen: boolean; // Drawer lateral del carrito
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isOpen: false,

  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),

  // Getter computado — como un getter en Flutter
  itemCount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
