import React from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CategorySectionProps {
  title: string;
  items: Product[];
}

export default function CategorySection({ title, items }: CategorySectionProps) {
  return (
    <section className="mb-12" id={title.toLowerCase()}>
      <h2 className="text-2xl font-semibold mb-4 text-primary">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            image={p.image}
            category={p.category}
          />
        ))}
      </div>
    </section>
  );
}
