"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProductOption = {
  id: string;
  name: string;
  code: number | null;
  product_variants: { id: string; name: string }[];
};

function productLabel(p: ProductOption) {
  return p.code != null ? `${p.code} · ${p.name}` : p.name;
}

function ProductCombobox({
  products,
  productId,
  onChange,
}: {
  products: ProductOption[];
  productId: string;
  onChange: (id: string) => void;
}) {
  const selected = products.find((p) => p.id === productId);
  const [query, setQuery] = useState(selected ? productLabel(selected) : "");
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.code ?? "").includes(q)
    );
  }, [products, query]);

  function select(p: ProductOption) {
    onChange(p.id);
    setQuery(productLabel(p));
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        required
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (productId) onChange("");
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Buscar por código o nombre…"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {open && results.length > 0 && (
        <ul
          onMouseDown={(e) => {
            e.preventDefault();
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
          }}
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg"
        >
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => select(p)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-stone-50"
            >
              <span className="font-medium text-stone-700">{p.code ?? "—"}</span>
              <span className="text-stone-500"> · {p.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StockAdjustForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState<"entry" | "adjustment">("entry");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const selected = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const qty = Number(quantity);
    if (!productId) {
      setMessage({ ok: false, text: "Elegí un producto de la lista" });
      return;
    }
    if (!qty) return;
    if (selected && selected.product_variants.length > 0 && !variantId) {
      setMessage({ ok: false, text: "Elegí una variante" });
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("adjust_stock", {
      p_product_id: productId,
      p_variant_id: variantId || undefined,
      p_quantity: type === "entry" ? Math.abs(qty) : qty,
      p_type: type,
      p_note: note.trim() || undefined,
    });
    setSaving(false);

    if (error) {
      setMessage({ ok: false, text: error.message });
      return;
    }

    setMessage({ ok: true, text: "Movimiento registrado" });
    setQuantity("");
    setNote("");
    router.refresh();
  }

  const inputCls =
    "rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-52 flex-1 flex-col gap-1">
        <label className="text-xs text-stone-500">Producto</label>
        <ProductCombobox
          products={products}
          productId={productId}
          onChange={(id) => {
            setProductId(id);
            setVariantId("");
          }}
        />
      </div>

      {selected && selected.product_variants.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-500">Variante</label>
          <select required value={variantId} onChange={(e) => setVariantId(e.target.value)} className={inputCls}>
            <option value="">Elegir…</option>
            {selected.product_variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-stone-500">Tipo</label>
        <select value={type} onChange={(e) => setType(e.target.value as "entry" | "adjustment")} className={inputCls}>
          <option value="entry">Entrada (+)</option>
          <option value="adjustment">Ajuste (±)</option>
        </select>
      </div>

      <div className="flex w-24 flex-col gap-1">
        <label className="text-xs text-stone-500">Cantidad</label>
        <input
          type="number"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={inputCls}
          placeholder={type === "entry" ? "10" : "-2"}
        />
      </div>

      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <label className="text-xs text-stone-500">Nota</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputCls}
          placeholder="Reposición proveedor…"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "…" : "Registrar"}
      </button>

      {message && (
        <p className={`w-full text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
