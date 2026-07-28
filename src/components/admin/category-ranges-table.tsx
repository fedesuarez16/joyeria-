"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, CategoryCodeRange } from "@/lib/queries";

type Row = { subcategoryId: string; start: string; end: string };

const inputCls =
  "w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-accent";

function SubcategoryRangeRow({
  categoryId,
  subcategory,
  initial,
  onRemove,
}: {
  categoryId: string;
  subcategory: Category;
  initial: { start: string; end: string };
  onRemove: () => void;
}) {
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("category_code_ranges").upsert(
      {
        category_id: categoryId,
        subcategory_id: subcategory.id,
        code_start: start === "" ? null : Number(start),
        code_end: end === "" ? null : Number(end),
      },
      { onConflict: "category_id,subcategory_id" }
    );
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    const supabase = createClient();
    const { error } = await supabase
      .from("category_code_ranges")
      .delete()
      .eq("category_id", categoryId)
      .eq("subcategory_id", subcategory.id);
    if (error) {
      setError(error.message);
      return;
    }
    onRemove();
  }

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="px-4 py-2.5">{subcategory.name}</td>
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
        <button
          type="button"
          onClick={remove}
          className="ml-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-400"
        >
          Quitar
        </button>
        {saved && <span className="ml-2 text-xs text-green-700">Guardado</span>}
        {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
      </td>
    </tr>
  );
}

function CategoryBlock({
  category,
  subcategories,
  initialRows,
}: {
  category: Category;
  subcategories: Category[];
  initialRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [toAdd, setToAdd] = useState("");

  const subcategoriesById = useMemo(
    () => new Map(subcategories.map((s) => [s.id, s])),
    [subcategories]
  );
  const usedIds = new Set(rows.map((r) => r.subcategoryId));
  const available = subcategories.filter((s) => !usedIds.has(s.id));

  function addRow() {
    if (!toAdd) return;
    setRows((prev) => [...prev, { subcategoryId: toAdd, start: "", end: "" }]);
    setToAdd("");
  }

  function removeRow(subcategoryId: string) {
    setRows((prev) => prev.filter((r) => r.subcategoryId !== subcategoryId));
  }

  return (
    <details className="rounded-xl border border-stone-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 font-medium">
        {category.name}
        <span className="ml-2 text-xs text-stone-400">
          {rows.length} {rows.length === 1 ? "subcategoría" : "subcategorías"}
        </span>
      </summary>
      <div className="border-t border-stone-100 px-4 py-3">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">Sin subcategorías con rango todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="px-4 py-2">Subcategoría</th>
                <th className="px-4 py-2">Código desde</th>
                <th className="px-4 py-2">Código hasta</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sub = subcategoriesById.get(r.subcategoryId);
                if (!sub) return null;
                return (
                  <SubcategoryRangeRow
                    key={r.subcategoryId}
                    categoryId={category.id}
                    subcategory={sub}
                    initial={{ start: r.start, end: r.end }}
                    onRemove={() => removeRow(r.subcategoryId)}
                  />
                );
              })}
            </tbody>
          </table>
        )}

        {available.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <select
              value={toAdd}
              onChange={(e) => setToAdd(e.target.value)}
              className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="">Agregar subcategoría…</option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addRow}
              disabled={!toAdd}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium hover:border-accent disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </details>
  );
}

export function CategoryRangesTable({
  categories,
  ranges,
}: {
  categories: Category[];
  ranges: CategoryCodeRange[];
}) {
  const categoryList = categories.filter((c) => c.type === "categoria");
  const subcategoryList = categories.filter((c) => c.type === "subcategoria");

  const rowsByCategory = new Map<string, Row[]>();
  for (const r of ranges) {
    const list = rowsByCategory.get(r.category_id) ?? [];
    list.push({
      subcategoryId: r.subcategory_id,
      start: r.code_start != null ? String(r.code_start) : "",
      end: r.code_end != null ? String(r.code_end) : "",
    });
    rowsByCategory.set(r.category_id, list);
  }

  return (
    <div className="space-y-3">
      {categoryList.map((c) => (
        <CategoryBlock
          key={c.id}
          category={c}
          subcategories={subcategoryList}
          initialRows={rowsByCategory.get(c.id) ?? []}
        />
      ))}
    </div>
  );
}
