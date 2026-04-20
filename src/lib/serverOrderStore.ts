import { getSupabaseAdmin } from './supabaseAdmin';

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
 * Creates a normalized order in Supabase (Relational: Orders + OrderItems).
 * Uses Service Role client to ensure success on restricted tables.
 */
export async function createRelationalOrder(order: Order, userId: string): Promise<void> {
  const admin = getSupabaseAdmin();

  // 1. Insert into 'orders'
  const { error: orderError } = await admin
    .from('orders')
    .insert([{
      id: order.id,
      user_id: userId,
      email: order.email,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      delivery_fee: order.deliveryFee,
      total_amount: order.totalAmount,
      shipping_details: order.shippingDetails,
      created_at: order.createdAt
    }]);

  if (orderError) {
    console.error('[DB ERROR] orders insert failed:', orderError);
    throw orderError;
  }

  // 2. Insert into 'order_items'
  const itemsToInsert = order.items.map(item => ({
    order_id: order.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.imageUrl
  }));

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('[DB ERROR] order_items insert failed:', itemsError);
    throw itemsError;
  }
}

/**
 * Fetches an order from Supabase reconstructed from normalized tables.
 */
export async function getOrder(orderId: string): Promise<Order | undefined> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    userId: data.user_id,
    email: data.email,
    subtotal: data.subtotal,
    tax: data.tax,
    deliveryFee: data.delivery_fee,
    totalAmount: data.total_amount,
    status: data.status,
    createdAt: data.created_at,
    shippingDetails: data.shipping_details,
    items: (data.order_items || []).map((item: any) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.image_url
    }))
  };
}

/**
 * Fetches all user orders with their items joined.
 */
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data || []).map((o: any) => ({
    id: o.id,
    userId: o.user_id,
    email: o.email,
    subtotal: o.subtotal,
    tax: o.tax,
    deliveryFee: o.delivery_fee,
    totalAmount: o.total_amount,
    status: o.status,
    createdAt: o.created_at,
    shippingDetails: o.shipping_details,
    items: (o.order_items || []).map((item: any) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.image_url
    }))
  }));
}

/**
 * Updates status using Service Role client.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}
