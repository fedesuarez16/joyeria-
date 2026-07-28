import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import {
  ManualOrderForm,
  type PickerProduct,
} from "@/components/admin/manual-order-form";

const TABS = [
  { key: "proceso", label: "En proceso", statuses: ["pending", "confirmed"] },
  { key: "entregados", label: "Entregados", statuses: ["delivered"] },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const isProceso = activeTab.key === "proceso";

  const supabase = await createClient();
  const [{ data: orders }, { data: rawProducts }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", activeTab.statuses)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("products")
      .select("id, name, price, stock, product_variants(id, name, price_override, stock)")
      .eq("active", true)
      .order("name"),
  ]);

  const products: PickerProduct[] = (rawProducts ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    stock: p.stock,
    variants: (p.product_variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price_override ?? p.price),
      stock: v.stock,
    })),
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold">Pedidos</h1>

      <div className="mt-4 flex gap-1 border-b border-stone-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "proceso" ? "/admin/pedidos" : `/admin/pedidos?tab=${t.key}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              t.key === activeTab.key
                ? "border-accent text-accent"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {isProceso && (
        <div className="mt-4">
          <ManualOrderForm products={products} />
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">
          {isProceso ? "Sin pedidos en proceso." : "Sin pedidos entregados todavía."}
        </p>
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
