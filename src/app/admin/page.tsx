import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: products }, { data: variants }, { data: recentOrders }, { count: orderCount }] =
    await Promise.all([
      supabase.from("products").select("id, name, slug, stock, low_stock_threshold, active"),
      supabase.from("product_variants").select("id, product_id, name, stock"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .neq("status", "cancelled"),
    ]);

  const variantsByProduct = new Map<string, { name: string; stock: number }[]>();
  for (const v of variants ?? []) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push({ name: v.name, stock: v.stock });
    variantsByProduct.set(v.product_id, list);
  }

  type Alert = { productName: string; detail: string; stock: number; out: boolean };
  const alerts: Alert[] = [];
  for (const p of products ?? []) {
    if (!p.active) continue;
    const vs = variantsByProduct.get(p.id);
    if (vs && vs.length > 0) {
      for (const v of vs) {
        if (v.stock <= p.low_stock_threshold) {
          alerts.push({
            productName: p.name,
            detail: v.name,
            stock: v.stock,
            out: v.stock === 0,
          });
        }
      }
    } else if (p.stock <= p.low_stock_threshold) {
      alerts.push({ productName: p.name, detail: "", stock: p.stock, out: p.stock === 0 });
    }
  }
  alerts.sort((a, b) => a.stock - b.stock);

  const activeCount = (products ?? []).filter((p) => p.active).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Productos activos" value={String(activeCount)} />
        <StatCard label="Pedidos totales" value={String(orderCount ?? 0)} />
        <StatCard
          label="Alertas de stock"
          value={String(alerts.length)}
          highlight={alerts.length > 0}
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold">Alertas de stock</h2>
        {alerts.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Todo en orden: sin productos con stock bajo.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {alerts.map((a, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                  a.out ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <span>
                  {a.productName}
                  {a.detail && <span className="text-stone-500"> · {a.detail}</span>}
                </span>
                <span className={`font-semibold ${a.out ? "text-red-700" : "text-amber-700"}`}>
                  {a.out ? "AGOTADO" : `${a.stock} u.`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-accent hover:underline">
            Ver todos
          </Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Sin pedidos todavía.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  #{o.order_number}
                  {o.customer_name && <span className="text-stone-500"> · {o.customer_name}</span>}
                </span>
                <span className="font-medium">{formatPrice(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
