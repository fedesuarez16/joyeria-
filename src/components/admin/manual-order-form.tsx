"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";

export type PickerVariant = { id: string; name: string; price: number; stock: number };
export type PickerProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  variants: PickerVariant[];
};

type Line = {
  productId: string;
  variantId: string | null;
  label: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export function ManualOrderForm({ products }: { products: PickerProduct[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [search, products]);

  const total = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);

  function addLine(
    product: PickerProduct,
    variant: PickerVariant | null
  ) {
    const variantId = variant?.id ?? null;
    const exists = lines.find(
      (l) => l.productId === product.id && l.variantId === variantId
    );
    if (exists) {
      setLines((prev) =>
        prev.map((l) =>
          l === exists
            ? { ...l, quantity: Math.min(l.quantity + 1, l.maxStock) }
            : l
        )
      );
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        productId: product.id,
        variantId,
        label: variant ? `${product.name} · ${variant.name}` : product.name,
        unitPrice: variant ? variant.price : product.price,
        quantity: 1,
        maxStock: variant ? variant.stock : product.stock,
      },
    ]);
    setSearch("");
  }

  function setQuantity(index: number, qty: number) {
    setLines((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, quantity: Math.max(1, Math.min(qty, l.maxStock)) } : l
      )
    );
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setLines([]);
    setCustomerName("");
    setCustomerPhone("");
    setSearch("");
    setError(null);
  }

  async function submit() {
    if (lines.length === 0) {
      setError("Agregá al menos un producto");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("create_order", {
      p_items: lines.map((l) => ({
        product_id: l.productId,
        variant_id: l.variantId,
        quantity: l.quantity,
      })),
      p_customer_name: customerName.trim(),
      p_customer_phone: customerPhone.trim(),
      p_coupon_code: undefined,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        + Nuevo pedido
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Nuevo pedido manual</h2>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-sm text-stone-400 hover:text-stone-700"
        >
          Cancelar
        </button>
      </div>

      {/* Buscador de productos */}
      <div className="relative mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre…"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg">
            {results.map((p) =>
              p.variants.length > 0 ? (
                <li key={p.id} className="border-b border-stone-100 last:border-0">
                  <p className="px-3 pt-2 text-xs font-medium text-stone-500">{p.name}</p>
                  {p.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.stock <= 0}
                      onClick={() => addLine(p, v)}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-stone-50 disabled:opacity-40"
                    >
                      <span>{v.name}</span>
                      <span className="text-xs text-stone-400">
                        {formatPrice(v.price)} · stock {v.stock}
                      </span>
                    </button>
                  ))}
                </li>
              ) : (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={p.stock <= 0}
                    onClick={() => addLine(p, null)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-stone-50 disabled:opacity-40"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-stone-400">
                      {formatPrice(p.price)} · stock {p.stock}
                    </span>
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      {/* Líneas agregadas */}
      {lines.length > 0 && (
        <ul className="mt-4 space-y-2">
          {lines.map((l, i) => (
            <li
              key={`${l.productId}:${l.variantId ?? ""}`}
              className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50 p-2.5 text-sm"
            >
              <span className="flex-1">{l.label}</span>
              <div className="flex items-center rounded-lg border border-stone-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(i, l.quantity - 1)}
                  className="px-2 py-1 hover:text-accent"
                  aria-label="Restar"
                >
                  −
                </button>
                <span className="w-7 text-center">{l.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(i, l.quantity + 1)}
                  disabled={l.quantity >= l.maxStock}
                  className="px-2 py-1 hover:text-accent disabled:opacity-30"
                  aria-label="Sumar"
                >
                  +
                </button>
              </div>
              <span className="w-24 text-right font-medium">
                {formatPrice(l.unitPrice * l.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="text-stone-400 hover:text-red-600"
                aria-label="Quitar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Datos del cliente */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nombre del cliente (opcional)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          type="text"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="text-sm text-stone-500">
          Total: <strong className="text-stone-800">{formatPrice(total)}</strong>
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={saving || lines.length === 0}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creando…" : "Crear pedido"}
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Al crear el pedido se descuenta el stock y se registra el movimiento, igual que
        una venta del catálogo.
      </p>
    </div>
  );
}
