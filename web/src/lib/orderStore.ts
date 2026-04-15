import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './store';

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  shippingDetails: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    phone: string;
  };
}

interface OrderStore {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getUserOrders: (userId: string) => Order[];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
      })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
      })),
      getUserOrders: (userId) => {
        return get().orders.filter(o => o.userId === userId);
      }
    }),
    {
      name: 'intuit-order-storage',
    }
  )
);
