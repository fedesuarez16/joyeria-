import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getProducts, type Category, type ProductWithRelations } from "@/lib/queries";
import { demoCategories, demoProducts } from "@/lib/demo-products";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { QuoteBand, BrandPromises, JoinClub } from "@/components/home-sections";
import { HeroCarousel } from "@/components/hero-carousel";
import { GoldMarquee } from "@/components/gold-marquee";
import { Reveal } from "@/components/reveal";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; subcategoria?: string }>;
}) {
  const { q, categoria, subcategoria } = await searchParams;
  let [categories, products]: [Category[], ProductWithRelations[]] = await Promise.all([
    getCategories(),
    getProducts({ q, categorySlug: categoria, subcategorySlug: subcategoria }),
  ]);

  // Sin productos en la base → catálogo de ejemplo para que la tienda no se vea vacía.
  let isDemo = false;
  if (products.length === 0) {
    const all = q || categoria || subcategoria ? await getProducts() : products;
    if (all.length === 0) {
      isDemo = true;
      products = demoProducts.filter(
        (p) =>
          (!categoria || p.categories?.slug === categoria) &&
          (!subcategoria || p.subcategory?.slug === subcategoria) &&
          (!q || p.name.toLowerCase().includes(q.toLowerCase())),
      );
      if (categories.length === 0) categories = demoCategories;
    }
  }

  const categoryOptions = categories.filter((c) => c.type === "categoria");
  const subcategoryOptions = categories.filter((c) => c.type === "subcategoria");

  function pillHref(next: { categoria?: string; subcategoria?: string }) {
    const params = new URLSearchParams();
    if (next.categoria) params.set("categoria", next.categoria);
    if (next.subcategoria) params.set("subcategoria", next.subcategoria);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/${qs ? `?${qs}` : ""}#catalogo`;
  }

  return (
    <>
      <HeroCarousel />
      <GoldMarquee />

      <section id="catalogo" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="font-sans text-xs uppercase tracking-[0.35em] text-accent">
              Nuestra colección
            </p>
            <h2 className="mt-2 font-display text-4xl font-medium">
              El <span className="italic text-accent">catálogo</span>
            </h2>
            <div className="gold-shimmer mt-3 h-px w-20" aria-hidden />
          </Reveal>
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <CategoryPill
            href={pillHref({ subcategoria })}
            label="Todas las categorías"
            active={!categoria}
          />
          {categoryOptions.map((c) => (
            <CategoryPill
              key={c.id}
              href={pillHref({ categoria: c.slug, subcategoria })}
              label={c.name}
              active={categoria === c.slug}
            />
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <CategoryPill
            href={pillHref({ categoria })}
            label="Todas las subcategorías"
            active={!subcategoria}
          />
          {subcategoryOptions.map((c) => (
            <CategoryPill
              key={c.id}
              href={pillHref({ categoria, subcategoria: c.slug })}
              label={c.name}
              active={subcategoria === c.slug}
            />
          ))}
        </div>

        {isDemo && (
          <p className="mt-4 text-xs uppercase tracking-wider text-neutral-400">
            Productos de muestra — cargá los tuyos desde el panel de admin.
          </p>
        )}

        {products.length === 0 ? (
          <p className="mt-16 text-center text-neutral-500">
            No encontramos productos{q ? ` para “${q}”` : ""}.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <QuoteBand />
      <BrandPromises />
      <JoinClub />
    </>
  );
}

function CategoryPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-gold"
          : "border-neutral-300 bg-white hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </Link>
  );
}
