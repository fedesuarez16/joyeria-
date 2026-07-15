import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-xl font-semibold">Pedidos</h1>
      {!orders || orders.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">Sin pedidos todavía.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    Pedido #{order.order_number}
                    {order.customer_name && (
                      <span className="font-normal text-stone-500"> · {order.customer_name}</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-400">
                    {new Date(order.created_at).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>

              <ul className="mt-3 border-t border-stone-100 pt-3 text-sm text-stone-600">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product_name}
                      {item.variant_name && ` (${item.variant_name})`}
                    </span>
                    <span>{formatPrice(Number(item.unit_price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 text-sm">
                <span className="text-stone-500">
                  {Number(order.discount) > 0 &&
                    `Descuento ${order.coupon_code ?? ""}: -${formatPrice(Number(order.discount))}`}
                </span>
                <span className="font-semibold">{formatPrice(Number(order.total))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
