import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  description?: string;
}

interface CartStore {
  guestCart: CartItem[];
  carts: Record<string, CartItem[]>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, amount: number) => void;
  clearCart: () => void;
  mergeGuestCart: (userId: string) => void;
  clearGuestCart: () => void;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  guestCart: [],
  carts: {},
  
  addToCart: (item) => set((state) => {
    const userId = useAuthStore.getState().user?.id;
    let targetCart = userId ? (state.carts[userId] || []) : state.guestCart;
    
    const existingIndex = targetCart.findIndex(i => i._id === item._id);
    let updatedCart;
    
    if (existingIndex >= 0) {
      updatedCart = [...targetCart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + 1
      };
    } else {
      updatedCart = [...targetCart, { ...item, quantity: 1 }];
    }
    
    if (userId) {
      return { carts: { ...state.carts, [userId]: updatedCart } };
    } else {
      return { guestCart: updatedCart };
    }
  }),

  removeFromCart: (id) => set((state) => {
    const userId = useAuthStore.getState().user?.id;
    let targetCart = userId ? (state.carts[userId] || []) : state.guestCart;
    const updatedCart = targetCart.filter(item => item._id !== id);
    
    if (userId) {
      return { carts: { ...state.carts, [userId]: updatedCart } };
    } else {
      return { guestCart: updatedCart };
    }
  }),

  updateQuantity: (id, amount) => set((state) => {
    const userId = useAuthStore.getState().user?.id;
    let targetCart = userId ? (state.carts[userId] || []) : state.guestCart;
    const updatedCart = targetCart.map(item => {
      if (item._id === id) {
        const newQuantity = item.quantity + amount;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    });
    
    if (userId) {
      return { carts: { ...state.carts, [userId]: updatedCart } };
    } else {
      return { guestCart: updatedCart };
    }
  }),

  clearCart: () => set((state) => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      return { carts: { ...state.carts, [userId]: [] } };
    } else {
      return { guestCart: [] };
    }
  }),

  mergeGuestCart: (userId) => set((state) => {
    if (!state.guestCart.length) return state;

    const currentCart = state.carts[userId] || [];
    let updatedCart = [...currentCart];

    state.guestCart.forEach(guestItem => {
      const existingIndex = updatedCart.findIndex(i => i._id === guestItem._id);
      if (existingIndex >= 0) {
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + guestItem.quantity
        };
      } else {
        updatedCart.push(guestItem);
      }
    });

    return { 
      carts: { ...state.carts, [userId]: updatedCart },
      guestCart: [] 
    };
  }),

  clearGuestCart: () => set({ guestCart: [] })
}));

// Automatically merge guest cart into user cart when user logs in, 
// and clear guest cart when user logs out. Decoupled from authStore.
useAuthStore.subscribe((state, prevState) => {
  if (state.isAuthenticated && state.user && !prevState.isAuthenticated) {
    useCartStore.getState().mergeGuestCart(state.user.id);
  } else if (!state.isAuthenticated && prevState.isAuthenticated) {
    useCartStore.getState().clearGuestCart();
  }
});
