import { createClient } from "@/lib/supabase/server";
import { StockAdjustForm } from "@/components/admin/stock-adjust-form";

const typeLabels: Record<string, string> = {
  sale: "Venta",
  entry: "Entrada",
  adjustment: "Ajuste",
  cancellation: "Cancelación",
};

export default async function InventoryPage() {
  const supabase = await createClient();

  const [{ data: movements }, { data: products }] = await Promise.all([
    supabase
      .from("stock_movements")
      .select("*, products(name), product_variants(name), orders(order_number)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("products")
      .select("id, name, product_variants(id, name)")
      .order("name"),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold">Inventario</h1>
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium">Registrar movimiento</h2>
          <StockAdjustForm products={products ?? []} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Historial de movimientos</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(movements ?? []).map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-stone-500">
                    {new Date(m.created_at).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    {m.products?.name ?? "—"}
                    {m.product_variants?.name && (
                      <span className="text-stone-500"> · {m.product_variants.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.quantity < 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                      }`}
                    >
                      {typeLabels[m.type] ?? m.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold ${
                      m.quantity < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-stone-500">
                    {m.orders?.order_number ? `Pedido #${m.orders.order_number}` : (m.note ?? "—")}
                  </td>
                </tr>
              ))}
              {(!movements || movements.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-400">
                    Sin movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
