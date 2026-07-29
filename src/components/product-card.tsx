import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { totalStock, type ProductWithRelations } from "@/lib/queries";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
  const stock = totalStock(product);
  const outOfStock = stock <= 0;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-gold/60 hover:shadow-lg"
    >
      <div className="relative aspect-square bg-neutral-100">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-300">
            💍
          </div>
        )}
        {/* Destello dorado que barre la pieza al hacer hover */}
        <span
          className="card-shine pointer-events-none absolute inset-0 z-10"
          aria-hidden
        />
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-stone-800/90 px-2.5 py-1 text-xs font-medium text-white">
            Agotado
          </span>
        )}
      </div>
      <div className="p-3">
        {product.categories && (
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            {product.categories.name}
          </p>
        )}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium">{product.name}</h3>
        <p className="mt-1 font-semibold text-accent">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
