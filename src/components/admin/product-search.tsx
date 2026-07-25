"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/queries";

export function ProductSearch({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  function pushParams(next: URLSearchParams) {
    const qs = next.toString();
    router.replace(`/admin/productos${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function onQChange(next: string) {
    setQ(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) params.set("q", next.trim());
      else params.delete("q");
      pushParams(params);
    }, 350);
  }

  function onCategoryChange(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) params.set("categoria", categoryId);
    else params.delete("categoria");
    pushParams(params);
  }

  const inputCls =
    "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        placeholder="Buscar por código o nombre…"
        className={`${inputCls} sm:max-w-xs`}
      />
      <select
        defaultValue={searchParams.get("categoria") ?? ""}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`${inputCls} sm:max-w-xs`}
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.type === "categoria" ? c.name : `— ${c.name}`}
          </option>
        ))}
      </select>
    </div>
  );
}
