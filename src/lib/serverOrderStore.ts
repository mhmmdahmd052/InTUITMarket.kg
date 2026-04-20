import { supabase } from './supabase';

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export type Order = {
  id: string;
  userId: string;
  email: string;
  items: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  shippingDetails?: any;
};

/**
 * Creates a new order in Supabase linked to a authenticated user ID.
 */
export async function createOrder(order: Order, userId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .insert([{
      id: order.id,
      user_id: userId,
      email: order.email,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      delivery_fee: order.deliveryFee,
      total: order.totalAmount,
      status: order.status,
      created_at: order.createdAt,
      shipping_details: order.shippingDetails
    }]);

  if (error) {
    console.error('Supabase createOrder error:', error);
    throw error;
  }
}

/**
 * Fetches a single order by ID from Supabase.
 */
export async function getOrder(orderId: string): Promise<Order | undefined> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !data) {
    if (error) console.error('Supabase getOrder error:', error);
    return undefined;
  }

  return {
    id: data.id,
    userId: data.user_id,
    email: data.email,
    items: data.items,
    subtotal: data.subtotal || 0,
    tax: data.tax || 0,
    deliveryFee: data.delivery_fee || 0,
    totalAmount: data.total,
    status: data.status,
    createdAt: data.created_at,
    shippingDetails: data.shipping_details
  };
}

/**
 * Fetches all orders for a specific user ID from Supabase.
 */
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getOrdersByUser error:', error);
    return [];
  }

  return (data || []).map(o => ({
    id: o.id,
    userId: o.user_id,
    email: o.email,
    items: o.items,
    subtotal: o.subtotal || 0,
    tax: o.tax || 0,
    deliveryFee: o.delivery_fee || 0,
    totalAmount: o.total,
    status: o.status,
    createdAt: o.created_at,
    shippingDetails: o.shipping_details
  }));
}

/**
 * Updates an order status in Supabase.
 */
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Supabase updateOrderStatus error:', error);
    throw error;
  }
}
