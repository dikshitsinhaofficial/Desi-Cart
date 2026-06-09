import { products } from "./lib/products";
import ProductCard from "./components/ProductCard";
import CategorySection from "./components/CategorySection";

export default function Home() {
  const categories = ["Electrical", "Gym", "Clothing", "Food"]; // 4 categories, 15 items each = 60 items

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero banner */}
      <section className="relative bg-primary text-white py-20 mb-12 text-center">
        <h1 className="text-5xl font-extrabold">Welcome to Desi‑Cart</h1>
        <p className="mt-4 text-xl">Shop from a curated collection of quality products.</p>
      </section>

      {/* Category sections */}
      {categories.map((cat) => (
        <CategorySection
          key={cat}
          title={cat}
          items={products.filter((p) => p.category === cat)}
        />
      ))}
    </main>
  );
}