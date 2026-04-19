export type InvoiceData = {
  invoiceId: string;
  createdAt: string;
  items: any[];
  total: number;
};

export function generateInvoice(order: { id: string; createdAt: string; items: any[]; totalAmount?: number; total?: number }): InvoiceData {
  const total = order.totalAmount ?? order.total ?? 0;
  return {
    invoiceId: `INV-${order.id.slice(-8).toUpperCase()}`,
    createdAt: order.createdAt,
    items: order.items,
    total: total
  };
}
