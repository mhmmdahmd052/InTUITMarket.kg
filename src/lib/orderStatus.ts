export const ORDER_STEPS = [
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered"
] as const;

export type OrderStatus = typeof ORDER_STEPS[number];

export function getStatusTimeline(status: OrderStatus) {
  const index = ORDER_STEPS.indexOf(status);

  return ORDER_STEPS.map((step, i) => ({
    label: step.replace(/_/g, ' '),
    done: i <= index
  }));
}
