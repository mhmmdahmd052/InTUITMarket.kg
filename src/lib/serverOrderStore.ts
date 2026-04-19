import fs from 'fs/promises';
import path from 'path';

const FILE_PATH = path.join('/tmp', 'orders.json');

export type Order = {
  id: string;
  email: string;
  items: any[];
  total: number;
  status: "processing" | "shipped" | "out_for_delivery" | "delivered";
  createdAt: string;
  shippingDetails?: any;
};

export async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export async function writeOrders(orders: Order[]): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function createOrder(order: Order): Promise<void> {
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  const orders = await readOrders();
  return orders.find(o => o.id === orderId);
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  const orders = await readOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    await writeOrders(orders);
  }
}
