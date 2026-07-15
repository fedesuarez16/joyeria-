import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold">Nuevo producto</h1>
      <ProductForm categories={categories} product={null} />
    </div>
  );
}
