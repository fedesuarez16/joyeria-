"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import type { Database } from "@/lib/database.types";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      value: Number(value),
      max_uses: maxUses ? Number(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    setSaving(false);

    if (error) {
      setError(error.code === "23505" ? "Ya existe un cupón con ese código" : error.message);
      return;
    }

    setCode("");
    setValue("");
    setMaxUses("");
    setExpiresAt("");
    router.refresh();
  }

  async function toggleActive(coupon: Coupon) {
    const supabase = createClient();
    await supabase.from("coupons").update({ active: !coupon.active }).eq("id", coupon.id);
    router.refresh();
  }

  async function remove(coupon: Coupon) {
    const supabase = createClient();
    await supabase.from("coupons").delete().eq("id", coupon.id);
    router.refresh();
  }

  const inputCls =
    "rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="mt-4 space-y-6">
      <form onSubmit={createCoupon} className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Nuevo cupón</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Código</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VERANO20"
              className={`${inputCls} w-36 uppercase`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Tipo</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
              className={inputCls}
            >
              <option value="percent">% porcentaje</option>
              <option value="fixed">$ monto fijo</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Valor</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={discountType === "percent" ? "20" : "5000"}
              className={`${inputCls} w-24`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Usos máx. (opc.)</label>
            <input
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className={`${inputCls} w-28`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">Vence (opc.)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Crear
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descuento</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Vence</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discount_type === "percent" ? `${c.value}%` : formatPrice(Number(c.value))}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {c.expires_at
                    ? new Date(c.expires_at).toLocaleDateString("es-AR")
                    : "Sin vencimiento"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                    }`}
                  >
                    {c.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    className="text-stone-400 hover:text-red-600"
                    aria-label="Eliminar cupón"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-400">
                  Sin cupones creados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
