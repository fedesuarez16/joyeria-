"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/queries";

export function AddToCart({ product }: { product: ProductWithRelations }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const hasVariants = product.product_variants.length > 0;
  const [variantId, setVariantId] = useState<string | null>(
    hasVariants ? null : "none"
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => product.product_variants.find((v) => v.id === variantId) ?? null,
    [product.product_variants, variantId]
  );

  const stock = hasVariants ? (variant?.stock ?? 0) : product.stock;
  const price = variant?.price_override ?? product.price;
  const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
  const canAdd = hasVariants ? variant !== null && stock > 0 : stock > 0;

  function handleAdd(goToCart: boolean) {
    if (!canAdd) return;
    addItem(
      {
        productId: product.id,
        variantId: hasVariants ? variant!.id : null,
        name: product.name,
        variantName: hasVariants ? variant!.name : null,
        price,
        imageUrl: image?.url ?? null,
        maxStock: stock,
      },
      quantity
    );
    if (goToCart) {
      router.push("/carrito");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    }
  }

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <p className="mb-2 text-sm font-medium">Variante</p>
          <div className="flex flex-wrap gap-2">
            {product.product_variants.map((v) => {
              const selected = v.id === variantId;
              const out = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-stone-300 bg-white hover:border-accent"
                  }`}
                >
                  {v.name}
                  {v.price_override != null && ` · ${formatPrice(v.price_override)}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(!hasVariants || variant) &&
        (stock > 0 ? (
          <p className="text-sm text-stone-500">
            {stock <= 3 ? (
              <span className="font-medium text-amber-700">¡Últimas {stock} unidades!</span>
            ) : (
              `Stock disponible: ${stock}`
            )}
          </p>
        ) : (
          <p className="text-sm font-medium text-red-600">Sin stock</p>
        ))}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-stone-300 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg leading-none hover:text-accent"
            aria-label="Restar"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            className="px-3 py-2 text-lg leading-none hover:text-accent"
            aria-label="Sumar"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={!canAdd}
          onClick={() => handleAdd(false)}
          className="flex-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "Agregado ✓" : "Agregar al carrito"}
        </button>
      </div>

      <button
        type="button"
        disabled={!canAdd}
        onClick={() => handleAdd(true)}
        className="w-full rounded-lg border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Comprar ahora
      </button>
    </div>
  );
}
