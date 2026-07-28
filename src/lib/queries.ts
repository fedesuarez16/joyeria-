import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Variant = Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type CategoryCodeRange =
  Database["public"]["Tables"]["category_code_ranges"]["Row"];

export type ProductWithRelations = Product & {
  categories: Category | null;
  subcategory: Category | null;
  product_images: ProductImage[];
  product_variants: Variant[];
};

const PRODUCT_SELECT =
  "*, categories:categories!products_category_id_fkey(*), subcategory:categories!products_subcategory_id_fkey(*), product_images(*), product_variants(*)";

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("position");
  return data ?? [];
}

export async function getCategoryCodeRanges() {
  const supabase = await createClient();
  const { data } = await supabase.from("category_code_ranges").select("*");
  return data ?? [];
}

export async function getProducts(
  opts: { q?: string; categorySlug?: string; subcategorySlug?: string } = {}
) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (opts.q) {
    query = query.or(`name.ilike.%${opts.q}%,description.ilike.%${opts.q}%`);
  }

  const { data } = await query;
  let products = (data ?? []) as ProductWithRelations[];

  if (opts.categorySlug) {
    products = products.filter((p) => p.categories?.slug === opts.categorySlug);
  }
  if (opts.subcategorySlug) {
    products = products.filter((p) => p.subcategory?.slug === opts.subcategorySlug);
  }

  return products;
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return data as ProductWithRelations | null;
}

/** Stock total: si hay variantes, suma de variantes; si no, stock del producto. */
export function totalStock(p: ProductWithRelations): number {
  if (p.product_variants.length > 0) {
    return p.product_variants.reduce((acc, v) => acc + v.stock, 0);
  }
  return p.stock;
}
