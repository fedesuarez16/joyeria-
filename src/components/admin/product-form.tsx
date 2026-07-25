"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, ProductWithRelations } from "@/lib/queries";

type VariantDraft = {
  id?: string;
  name: string;
  stock: number;
  price_override: string; // vacío = usa precio del producto
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product: ProductWithRelations | null;
}) {
  const router = useRouter();
  const isNew = product === null;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(product?.subcategory_id ?? "");
  const [code, setCode] = useState(product?.code != null ? String(product.code) : "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [threshold, setThreshold] = useState(
    product ? String(product.low_stock_threshold) : "3"
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.product_variants.map((v) => ({
      id: v.id,
      name: v.name,
      stock: v.stock,
      price_override: v.price_override != null ? String(v.price_override) : "",
    })) ?? []
  );
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [images, setImages] = useState(
    [...(product?.product_images ?? [])].sort((a, b) => a.position - b.position)
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();

    try {
      const payload = {
        name: name.trim(),
        slug: product?.slug ?? slugify(name),
        description,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        code: code === "" ? null : Number(code),
        price: Number(price),
        stock: Number(stock),
        low_stock_threshold: Number(threshold),
      };

      let productId = product?.id;

      if (isNew) {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      } else {
        const { error } = await supabase
          .from("products")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", productId!);
        if (error) throw error;
      }

      // variantes
      for (const vid of deletedVariantIds) {
        await supabase.from("product_variants").delete().eq("id", vid);
      }
      for (const v of variants) {
        const vPayload = {
          product_id: productId!,
          name: v.name.trim(),
          stock: v.stock,
          price_override: v.price_override === "" ? null : Number(v.price_override),
        };
        if (v.id) {
          const { error } = await supabase
            .from("product_variants")
            .update(vPayload)
            .eq("id", v.id);
          if (error) throw error;
        } else if (v.name.trim()) {
          const { error } = await supabase.from("product_variants").insert(vPayload);
          if (error) throw error;
        }
      }

      // imágenes nuevas
      let position = images.length;
      for (const file of newFiles) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);

        const { error } = await supabase
          .from("product_images")
          .insert({ product_id: productId!, url: publicUrl, position: position++ });
        if (error) throw error;
      }

      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSaving(false);
    }
  }

  async function removeImage(imageId: string) {
    const supabase = createClient();
    await supabase.from("product_images").delete().eq("id", imageId);
    setImages((imgs) => imgs.filter((i) => i.id !== imageId));
  }

  const inputCls =
    "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent";

  const categoryOptions = categories.filter((c) => c.type === "categoria");
  const subcategoryOptions = categories.filter((c) => c.type === "subcategoria");

  const selectedCategory = categoryOptions.find((c) => c.id === categoryId);
  const codeNum = code === "" ? null : Number(code);
  const codeOutOfRange =
    codeNum != null &&
    selectedCategory != null &&
    selectedCategory.code_start != null &&
    selectedCategory.code_end != null &&
    (codeNum < selectedCategory.code_start || codeNum > selectedCategory.code_end);

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
            <option value="">Sin categoría</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subcategoría</label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            className={inputCls}
          >
            <option value="">Sin subcategoría</option>
            {subcategoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-[calc(50%-0.5rem)]">
        <label className="mb-1 block text-sm font-medium">Código</label>
        <input
          type="number"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={inputCls}
        />
        {codeOutOfRange && (
          <p className="mt-1 text-xs text-amber-600">
            Ese código está fuera del rango de {selectedCategory!.name} ({selectedCategory!.code_start}
            –{selectedCategory!.code_end}). Se puede guardar igual.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Precio (ARS)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Stock {variants.length > 0 && <span className="text-stone-400">(sin variantes)</span>}
          </label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={variants.length > 0}
            className={`${inputCls} disabled:bg-stone-100`}
          />
        </div>
      </div>

      <div className="max-w-[calc(50%-0.5rem)]">
        <label className="mb-1 block text-sm font-medium">Alerta de stock bajo (≤)</label>
        <input
          type="number"
          min="0"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className={inputCls}
        />
      </div>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium">Variantes (talles, colores…)</legend>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre (ej: Talle 16)"
                value={v.name}
                onChange={(e) =>
                  setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
                className={`${inputCls} flex-1`}
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) =>
                  setVariants((vs) =>
                    vs.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x))
                  )
                }
                className={`${inputCls} w-24`}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio (opc.)"
                value={v.price_override}
                onChange={(e) =>
                  setVariants((vs) =>
                    vs.map((x, j) => (j === i ? { ...x, price_override: e.target.value } : x))
                  )
                }
                className={`${inputCls} w-32`}
              />
              <button
                type="button"
                onClick={() => {
                  if (v.id) setDeletedVariantIds((ids) => [...ids, v.id!]);
                  setVariants((vs) => vs.filter((_, j) => j !== i));
                }}
                className="px-2 text-stone-400 hover:text-red-600"
                aria-label="Quitar variante"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVariants((vs) => [...vs, { name: "", stock: 0, price_override: "" }])}
          className="mt-3 text-sm text-accent hover:underline"
        >
          + Agregar variante
        </button>
      </fieldset>

      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium">Fotos</legend>
        {images.length > 0 && (
          <div className="mb-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100">
                <Image src={img.url} alt="" fill sizes="100px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                  aria-label="Eliminar foto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
          className="text-sm"
        />
        {newFiles.length > 0 && (
          <p className="mt-1 text-xs text-stone-500">
            {newFiles.length} foto{newFiles.length > 1 ? "s" : ""} para subir al guardar
          </p>
        )}
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm hover:border-stone-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
