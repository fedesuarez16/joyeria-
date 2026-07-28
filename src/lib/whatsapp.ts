import type { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/format";

type OrderSummary = {
  orderNumber: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  customerName?: string;
};

export function buildWhatsAppUrl(items: CartItem[], order: OrderSummary): string {
  const lines: string[] = [];
  lines.push(`¡Hola! Quiero confirmar mi pedido *#${order.orderNumber}* 🛍️`);
  lines.push("");

  for (const item of items) {
    const name = item.variantName ? `${item.name} (${item.variantName})` : item.name;
    lines.push(`• ${item.quantity}x ${name} — ${formatPrice(item.price * item.quantity)}`);
  }

  lines.push("");
  lines.push(`Subtotal: ${formatPrice(order.subtotal)}`);
  if (order.discount > 0) {
    lines.push(
      `Descuento${order.couponCode ? ` (${order.couponCode})` : ""}: -${formatPrice(order.discount)}`
    );
  }
  lines.push(`*Total: ${formatPrice(order.total)}*`);

  if (order.customerName) {
    lines.push("");
    lines.push(`A nombre de: ${order.customerName}`);
  }

  const phone = "5492994222931";
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
