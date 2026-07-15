import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = { title: "Mi cuenta" };

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cuenta");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Mi cuenta</h1>
        <SignOutButton />
      </div>
      <p className="mt-1 text-sm text-stone-500">{user.email}</p>

      <h2 className="mt-8 text-lg font-semibold">Mis pedidos</h2>
      {!orders || orders.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">Todavía no hiciste pedidos.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Pedido #{order.order_number}</p>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-stone-400">
                {new Date(order.created_at).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <ul className="mt-2 text-sm text-stone-600">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product_name}
                    {item.variant_name && ` (${item.variant_name})`}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-semibold">{formatPrice(Number(order.total))}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
