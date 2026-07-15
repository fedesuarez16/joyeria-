"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/queries";

export function BulkPriceForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [percent, setPercent] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [categoryId, setCategoryId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const pct = Number(percent);
  const signedPercent = direction === "increase" ? pct : -pct;
  const categoryName = categoryId
    ? categories.find((c) => c.id === categoryId)?.name
    : "todos los productos";

  async function apply() {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("bulk_update_prices", {
      p_percent: signedPercent,
      p_category_id: categoryId || undefined,
    });
    setSaving(false);
    setConfirming(false);

    if (error) {
      setMessage({ ok: false, text: error.message });
      return;
    }

    setMessage({ ok: true, text: `Listo: se actualizaron ${data} productos.` });
    setPercent("");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Acción</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "increase" | "decrease")}
            className={inputCls}
          >
            <option value="increase">Aumentar</option>
            <option value="decrease">Bajar</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Porcentaje</label>
          <input
            type="number"
            min="0.01"
            max="500"
            step="0.01"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="10"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alcance</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
          <option value="">Todos los productos</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              Solo {c.name}
            </option>
          ))}
        </select>
      </div>

      {!confirming ? (
        <button
          type="button"
          disabled={!pct || pct <= 0}
          onClick={() => setConfirming(true)}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          Aplicar cambio de precios
        </button>
      ) : (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm">
            ¿Confirmás {direction === "increase" ? "aumentar" : "bajar"} <strong>{pct}%</strong> los
            precios de <strong>{categoryName}</strong>? Esta acción no se puede deshacer automáticamente.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={apply}
              disabled={saving}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Aplicando…" : "Sí, aplicar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
