import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getCategoryCodeRanges,
  type ProductWithRelations,
} from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [categories, ranges, { data: product }] = await Promise.all([
    getCategories(),
    getCategoryCodeRanges(),
    supabase
      .from("products")
      .select(
        "*, categories:categories!products_category_id_fkey(*), subcategory:categories!products_subcategory_id_fkey(*), product_images(*), product_variants(*)"
      )
      .eq("id", id)
      .single(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold">Editar producto</h1>
      <ProductForm
        categories={categories}
        ranges={ranges}
        product={product as ProductWithRelations}
      />
    </div>
  );
}
