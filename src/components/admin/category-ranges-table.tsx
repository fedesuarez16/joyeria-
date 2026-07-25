"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/queries";

function CategoryRangeRow({ category }: { category: Category }) {
  const [start, setStart] = useState(category.code_start != null ? String(category.code_start) : "");
  const [end, setEnd] = useState(category.code_end != null ? String(category.code_end) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({
        code_start: start === "" ? null : Number(start),
        code_end: end === "" ? null : Number(end),
      })
      .eq("id", category.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputCls =
    "w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-accent";

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="px-4 py-2.5">{category.name}</td>
      <td className="px-4 py-2.5">
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
          {category.type === "categoria" ? "Categoría" : "Subcategoría"}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="Desde"
          className={inputCls}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="Hasta"
          className={inputCls}
        />
      </td>
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium hover:border-accent disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        {saved && <span className="ml-2 text-xs text-green-700">Guardado</span>}
        {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
      </td>
    </tr>
  );
}

export function CategoryRangesTable({ categories }: { categories: Category[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Código desde</th>
            <th className="px-4 py-3">Código hasta</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <CategoryRangeRow key={c.id} category={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
