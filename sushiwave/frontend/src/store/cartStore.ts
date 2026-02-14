import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, CartTotals } from '@/types';
import { storage } from '@/lib/utils';

// ==========================================
// Cart State Interface
// ==========================================

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  
  // Getters
  getItemCount: () => number;
  getItemById: (productId: string) => CartItem | undefined;
  getCartItems: () => CartItem[];
}

// ==========================================
// Cart Store
// ==========================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Add item to cart
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id
          );

          if (existingItem) {
            // Update quantity if item exists
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              product.stockQuantity
            );
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              { productId: product.id, quantity: Math.min(quantity, product.stockQuantity) },
            ],
          };
        });
      },

      // Remove item from cart
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      // Update item quantity
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },

      // Set items (used for syncing with server)
      setItems: (items: CartItem[]) => {
        set({ items });
      },

      // Get total item count
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get item by product ID
      getItemById: (productId: string) => {
        return get().items.find((item) => item.productId === productId);
      },

      // Get cart items
      getCartItems: () => {
        return get().items;
      },
    }),
    {
      name: 'sushiwave-cart',
      storage: {
        getItem: (name) => {
          const value = storage.get<string>(name, '');
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.remove(name);
        },
      },
    }
  )
);

// ==========================================
// Cart Hooks
// ==========================================

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
export const useIsInCart = (productId: string) =>
  useCartStore((state) => state.items.some((item) => item.productId === productId));