import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/queries";
import { demoProducts } from "@/lib/demo-products";
import { formatPrice } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product =
    (await getProductBySlug(slug)) ?? demoProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const images = [...product.product_images].sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-accent">Catálogo</Link>
        {product.categories && (
          <>
            {" / "}
            <Link href={`/?categoria=${product.categories.slug}`} className="hover:text-accent">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl text-stone-300">💍</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                  <Image src={img.url} alt={product.name} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categories && (
            <p className="text-xs uppercase tracking-widest text-stone-400">
              {product.categories.name}
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-semibold">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-accent">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="mt-5 whitespace-pre-line leading-relaxed text-stone-600">
              {product.description}
            </p>
          )}

          <div className="mt-7">
            <AddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
