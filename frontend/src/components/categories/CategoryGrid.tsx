import { CategoryCard } from "@/components/categories/CategoryCard";
import { getCategories } from "@/lib/api/categories";

export async function CategoryGrid() {
  const categories = await getCategories();
  return (
    <section className="category-grid container">
      {categories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </section>
  );
}
