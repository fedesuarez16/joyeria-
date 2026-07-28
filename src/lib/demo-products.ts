import type { Category, ProductWithRelations } from "@/lib/queries";

/**
 * Datos de ejemplo para mostrar el catálogo mientras no haya productos
 * cargados en la base. Se reemplazan solos apenas el admin cree productos.
 */

const now = "2026-01-01T00:00:00Z";

function category(
  id: string,
  name: string,
  slug: string,
  position: number,
  type: "categoria" | "subcategoria"
): Category {
  return { id, name, slug, position, type, created_at: now };
}

export const demoCategories: Category[] = [
  category("demo-cat-plata-925", "Plata 925", "plata-925", 1, "categoria"),
  category("demo-cat-acero-blanco", "Acero Blanco", "acero-blanco", 2, "categoria"),
  category("demo-cat-acero-dorado", "Acero Dorado", "acero-dorado", 3, "categoria"),
  category("demo-cat-acero-quirurgico", "Acero Quirúrgico", "acero-quirurgico", 4, "categoria"),
  category("demo-cat-varios", "Varios", "varios", 5, "categoria"),
  category("demo-cat-relojes", "Relojes", "relojes", 6, "categoria"),
  category("demo-cat-bolsos", "Bolsos", "bolsos", 7, "categoria"),
  category("demo-cat-perfumes", "Perfumes", "perfumes", 8, "categoria"),
  category("demo-cat-gafas-lentes", "Gafas o Lentes", "gafas-lentes", 9, "categoria"),
  category("demo-cat-abridores", "Abridores", "abridores", 10, "subcategoria"),
  category("demo-cat-anillos", "Anillos", "anillos", 11, "subcategoria"),
  category("demo-cat-aros", "Aros", "aros", 12, "subcategoria"),
  category("demo-cat-cadenas", "Cadenas", "cadenas", 13, "subcategoria"),
  category("demo-cat-collares", "Collares", "collares", 14, "subcategoria"),
  category("demo-cat-conjuntos", "Conjuntos", "conjuntos", 15, "subcategoria"),
  category("demo-cat-dijes", "Dijes", "dijes", 16, "subcategoria"),
  category("demo-cat-pulseras", "Pulseras", "pulseras", 17, "subcategoria"),
  category("demo-cat-tobilleras", "Tobilleras", "tobilleras", 18, "subcategoria"),
  category("demo-cat-esclavas", "Esclavas", "esclavas", 19, "subcategoria"),
];

function product(opts: {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: Category;
  subcategory: Category;
  image: string;
  description: string;
}): ProductWithRelations {
  return {
    id: opts.id,
    name: opts.name,
    slug: opts.slug,
    description: opts.description,
    price: opts.price,
    stock: 10,
    low_stock_threshold: 3,
    active: true,
    category_id: opts.category.id,
    subcategory_id: opts.subcategory.id,
    code: null,
    created_at: now,
    updated_at: now,
    categories: opts.category,
    subcategory: opts.subcategory,
    product_images: [
      { id: `${opts.id}-img`, product_id: opts.id, url: opts.image, position: 0, created_at: now },
    ],
    product_variants: [],
  };
}

const bySlug = (slug: string) => demoCategories.find((c) => c.slug === slug)!;
const plata925 = bySlug("plata-925");
const anillos = bySlug("anillos");
const collares = bySlug("collares");
const pulseras = bySlug("pulseras");
const aros = bySlug("aros");

export const demoProducts: ProductWithRelations[] = [
  product({
    id: "demo-1",
    name: "Anillo Solitario Aurora",
    slug: "anillo-solitario-aurora",
    price: 28999,
    category: plata925,
    subcategory: anillos,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    description: "Anillo solitario con piedra central de zirconia y baño de oro 18k.",
  }),
  product({
    id: "demo-2",
    name: "Anillo Eterno Dorado",
    slug: "anillo-eterno-dorado",
    price: 21499,
    category: plata925,
    subcategory: anillos,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
    description: "Dúo de anillos con terminación pulida espejo y baño de oro.",
  }),
  product({
    id: "demo-3",
    name: "Collar Gota de Luz",
    slug: "collar-gota-de-luz",
    price: 32999,
    category: plata925,
    subcategory: collares,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    description: "Collar con dije de cristal facetado y cadena fina bañada en oro.",
  }),
  product({
    id: "demo-4",
    name: "Cadena Veneciana Oro",
    slug: "cadena-veneciana-oro",
    price: 26499,
    category: plata925,
    subcategory: collares,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    description: "Cadena veneciana clásica, hipoalergénica, ideal para uso diario.",
  }),
  product({
    id: "demo-5",
    name: "Pulsera Perla Nocturna",
    slug: "pulsera-perla-nocturna",
    price: 18999,
    category: plata925,
    subcategory: pulseras,
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80",
    description: "Pulsera con perlas de río y detalles dorados.",
  }),
  product({
    id: "demo-6",
    name: "Pulsera Trenza Dorada",
    slug: "pulsera-trenza-dorada",
    price: 15999,
    category: plata925,
    subcategory: pulseras,
    image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80",
    description: "Set de pulseras trenzadas con baño de oro y cierre regulable.",
  }),
  product({
    id: "demo-7",
    name: "Aros Argolla Clásica",
    slug: "aros-argolla-clasica",
    price: 12999,
    category: plata925,
    subcategory: aros,
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
    description: "Argollas doradas livianas, el básico que nunca falla.",
  }),
  product({
    id: "demo-8",
    name: "Aros Perla Imperial",
    slug: "aros-perla-imperial",
    price: 16499,
    category: plata925,
    subcategory: aros,
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
    description: "Aros con perla natural y engarce dorado, elegancia atemporal.",
  }),
];
