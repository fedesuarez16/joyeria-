"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const options = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function onChange(next: string) {
    setSaving(true);
    const supabase = createClient();
    // Cancelar repone stock: se hace en la DB de forma atómica vía RPC.
    const { error } =
      next === "cancelled"
        ? await supabase.rpc("cancel_order", { p_order_id: orderId })
        : await supabase.from("orders").update({ status: next }).eq("id", orderId);
    setSaving(false);
    if (error) {
      alert(`No se pudo actualizar el pedido: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
