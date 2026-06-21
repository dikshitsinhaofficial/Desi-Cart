export type Product = {
  id: string;
  name: string;
  category: 'Electrical' | 'Gym' | 'Clothing' | 'Food';
  price: number;
  imageUrl: string;
};

export const products: Product[] = [];

const categories = ['Electrical', 'Gym', 'Clothing', 'Food'] as const;

let idCounter = 1;

categories.forEach((cat) => {
  for (let i = 1; i <= 15; i++) {
    const name = `${cat} Item ${i}`;
    const price = Math.floor(Math.random() * 9000) + 1000; // 1000-10000
    const imageUrl = `https://via.placeholder.com/300?text=${encodeURIComponent(name)}`;
    products.push({
      id: `prod-${idCounter++}`,
      name,
      category: cat,
      price,
      imageUrl,
    });
  }
});
