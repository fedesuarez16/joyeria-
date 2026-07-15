import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), product_images(url, position), product_variants(stock)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(products ?? []).map((p) => {
              const image = [...p.product_images].sort((a, b) => a.position - b.position)[0];
              const stock =
                p.product_variants.length > 0
                  ? p.product_variants.reduce((acc, v) => acc + v.stock, 0)
                  : p.stock;
              return (
                <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {image && (
                          <Image src={image.url} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{p.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <span className={stock === 0 ? "font-semibold text-red-600" : ""}>{stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ToggleActiveButton productId={p.id} active={p.active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/productos/${p.id}`} className="text-accent hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
