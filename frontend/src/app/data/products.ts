export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
}

export const categories = ['All', 'Electronics', 'Gym & Fitness', 'Clothes'] as const;

export const products: Product[] = [
  // Electronics (1-20)
  { id: 1, name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', subcategory: 'Smartphones', price: 129999, originalPrice: 144999, rating: 4.7, reviews: 12453, image: 'https://picsum.photos/seed/phone1/400/400', badge: 'Bestseller' },
  { id: 2, name: 'Apple iPhone 15 Pro Max', category: 'Electronics', subcategory: 'Smartphones', price: 156900, originalPrice: 169900, rating: 4.8, reviews: 28341, image: 'https://picsum.photos/seed/phone2/400/400', badge: 'Top Rated' },
  { id: 3, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', subcategory: 'Audio', price: 26990, originalPrice: 34990, rating: 4.6, reviews: 8762, image: 'https://picsum.photos/seed/audio1/400/400', badge: '23% Off' },
  { id: 4, name: 'Apple MacBook Air M3', category: 'Electronics', subcategory: 'Laptops', price: 114900, originalPrice: 129900, rating: 4.9, reviews: 5623, image: 'https://picsum.photos/seed/laptop1/400/400', badge: 'Premium' },
  { id: 5, name: 'Samsung 55" OLED Smart TV', category: 'Electronics', subcategory: 'TVs', price: 124990, originalPrice: 154990, rating: 4.5, reviews: 3241, image: 'https://picsum.photos/seed/tv1/400/400', badge: '19% Off' },
  { id: 6, name: 'JBL Flip 6 Bluetooth Speaker', category: 'Electronics', subcategory: 'Audio', price: 9999, originalPrice: 14999, rating: 4.4, reviews: 15632, image: 'https://picsum.photos/seed/speaker1/400/400' },
  { id: 7, name: 'Apple iPad Air M2', category: 'Electronics', subcategory: 'Tablets', price: 69900, originalPrice: 74900, rating: 4.7, reviews: 4521, image: 'https://picsum.photos/seed/tablet1/400/400' },
  { id: 8, name: 'Canon EOS R50 Camera', category: 'Electronics', subcategory: 'Cameras', price: 65990, originalPrice: 75990, rating: 4.5, reviews: 1892, image: 'https://picsum.photos/seed/camera1/400/400' },
  { id: 9, name: 'Dell UltraSharp 27" Monitor', category: 'Electronics', subcategory: 'Monitors', price: 34990, originalPrice: 42990, rating: 4.6, reviews: 2341, image: 'https://picsum.photos/seed/monitor1/400/400', badge: 'Best Value' },
  { id: 10, name: 'Apple Watch Series 9', category: 'Electronics', subcategory: 'Wearables', price: 41900, originalPrice: 49900, rating: 4.5, reviews: 7823, image: 'https://picsum.photos/seed/watch1/400/400' },
  { id: 11, name: 'Bose QuietComfort Ultra Earbuds', category: 'Electronics', subcategory: 'Audio', price: 24990, originalPrice: 29990, rating: 4.3, reviews: 5432, image: 'https://picsum.photos/seed/earbuds1/400/400' },
  { id: 12, name: 'HP Victus Gaming Laptop', category: 'Electronics', subcategory: 'Laptops', price: 62990, originalPrice: 79990, rating: 4.2, reviews: 3456, image: 'https://picsum.photos/seed/laptop2/400/400', badge: '21% Off' },
  { id: 13, name: 'Samsung Galaxy Buds3 Pro', category: 'Electronics', subcategory: 'Audio', price: 17999, originalPrice: 21999, rating: 4.4, reviews: 6789, image: 'https://picsum.photos/seed/buds1/400/400' },
  { id: 14, name: 'LG 43" 4K Smart TV', category: 'Electronics', subcategory: 'TVs', price: 32990, originalPrice: 44990, rating: 4.3, reviews: 4567, image: 'https://picsum.photos/seed/tv2/400/400', badge: '27% Off' },
  { id: 15, name: 'Logitech MX Master 3S Mouse', category: 'Electronics', subcategory: 'Accessories', price: 8995, originalPrice: 10995, rating: 4.7, reviews: 9876, image: 'https://picsum.photos/seed/mouse1/400/400' },
  { id: 16, name: 'OnePlus 12 5G', category: 'Electronics', subcategory: 'Smartphones', price: 64999, originalPrice: 69999, rating: 4.4, reviews: 11234, image: 'https://picsum.photos/seed/phone3/400/400' },
  { id: 17, name: 'Sony PlayStation 5 Slim', category: 'Electronics', subcategory: 'Gaming', price: 49990, originalPrice: 54990, rating: 4.8, reviews: 18923, image: 'https://picsum.photos/seed/ps5/400/400', badge: 'Hot Deal' },
  { id: 18, name: 'Nintendo Switch OLED', category: 'Electronics', subcategory: 'Gaming', price: 27490, originalPrice: 34990, rating: 4.6, reviews: 14532, image: 'https://picsum.photos/seed/switch1/400/400' },
  { id: 19, name: 'Kindle Paperwhite 5th Gen', category: 'Electronics', subcategory: 'E-Readers', price: 14999, originalPrice: 16999, rating: 4.5, reviews: 21345, image: 'https://picsum.photos/seed/kindle1/400/400' },
  { id: 20, name: 'Google Pixel 8 Pro', category: 'Electronics', subcategory: 'Smartphones', price: 83999, originalPrice: 106999, rating: 4.5, reviews: 7654, image: 'https://picsum.photos/seed/phone4/400/400', badge: '21% Off' },

  // Gym & Fitness (21-40)
  { id: 21, name: 'PowerMax 4HP Treadmill', category: 'Gym & Fitness', subcategory: 'Cardio', price: 42999, originalPrice: 59999, rating: 4.3, reviews: 2341, image: 'https://picsum.photos/seed/treadmill1/400/400', badge: '28% Off' },
  { id: 22, name: 'Adjustable Dumbbell Set 52.5 lbs', category: 'Gym & Fitness', subcategory: 'Weights', price: 14999, originalPrice: 22999, rating: 4.6, reviews: 5678, image: 'https://picsum.photos/seed/dumbbell1/400/400', badge: 'Bestseller' },
  { id: 23, name: 'Premium Yoga Mat 6mm', category: 'Gym & Fitness', subcategory: 'Yoga', price: 1499, originalPrice: 2999, rating: 4.4, reviews: 12345, image: 'https://picsum.photos/seed/yogamat1/400/400', badge: '50% Off' },
  { id: 24, name: 'Resistance Bands Set (5 Pack)', category: 'Gym & Fitness', subcategory: 'Accessories', price: 899, originalPrice: 1799, rating: 4.3, reviews: 8765, image: 'https://picsum.photos/seed/bands1/400/400' },
  { id: 25, name: 'Whey Protein Isolate 2kg', category: 'Gym & Fitness', subcategory: 'Nutrition', price: 3499, originalPrice: 4999, rating: 4.5, reviews: 15678, image: 'https://picsum.photos/seed/protein1/400/400', badge: 'Top Rated' },
  { id: 26, name: 'Spin Bike Pro X200', category: 'Gym & Fitness', subcategory: 'Cardio', price: 24999, originalPrice: 34999, rating: 4.2, reviews: 1234, image: 'https://picsum.photos/seed/spinbike1/400/400' },
  { id: 27, name: 'Olympic Barbell 20kg', category: 'Gym & Fitness', subcategory: 'Weights', price: 8999, originalPrice: 12999, rating: 4.7, reviews: 3456, image: 'https://picsum.photos/seed/barbell1/400/400' },
  { id: 28, name: 'Pull Up Bar Doorway Mount', category: 'Gym & Fitness', subcategory: 'Equipment', price: 1299, originalPrice: 2499, rating: 4.1, reviews: 6789, image: 'https://picsum.photos/seed/pullup1/400/400' },
  { id: 29, name: 'Foam Roller 18" High Density', category: 'Gym & Fitness', subcategory: 'Recovery', price: 999, originalPrice: 1999, rating: 4.4, reviews: 4567, image: 'https://picsum.photos/seed/roller1/400/400' },
  { id: 30, name: 'Gym Gloves Premium Leather', category: 'Gym & Fitness', subcategory: 'Accessories', price: 799, originalPrice: 1499, rating: 4.2, reviews: 7890, image: 'https://picsum.photos/seed/gloves1/400/400' },
  { id: 31, name: 'Kettlebell Cast Iron 16kg', category: 'Gym & Fitness', subcategory: 'Weights', price: 2499, originalPrice: 3999, rating: 4.5, reviews: 2345, image: 'https://picsum.photos/seed/kettle1/400/400' },
  { id: 32, name: 'Ab Roller Wheel Pro', category: 'Gym & Fitness', subcategory: 'Core', price: 699, originalPrice: 1299, rating: 4.3, reviews: 9012, image: 'https://picsum.photos/seed/abroller1/400/400', badge: '46% Off' },
  { id: 33, name: 'Skipping Rope Speed Wire', category: 'Gym & Fitness', subcategory: 'Cardio', price: 499, originalPrice: 999, rating: 4.1, reviews: 11234, image: 'https://picsum.photos/seed/rope1/400/400' },
  { id: 34, name: 'Creatine Monohydrate 500g', category: 'Gym & Fitness', subcategory: 'Nutrition', price: 999, originalPrice: 1499, rating: 4.6, reviews: 8901, image: 'https://picsum.photos/seed/creatine1/400/400' },
  { id: 35, name: 'Gym Bag Waterproof Duffle', category: 'Gym & Fitness', subcategory: 'Accessories', price: 1299, originalPrice: 2499, rating: 4.4, reviews: 5678, image: 'https://picsum.photos/seed/gymbag1/400/400' },
  { id: 36, name: 'Flat Weight Bench Press', category: 'Gym & Fitness', subcategory: 'Equipment', price: 6999, originalPrice: 9999, rating: 4.5, reviews: 1456, image: 'https://picsum.photos/seed/bench1/400/400' },
  { id: 37, name: 'Shaker Bottle 700ml BPA Free', category: 'Gym & Fitness', subcategory: 'Accessories', price: 349, originalPrice: 699, rating: 4.2, reviews: 14567, image: 'https://picsum.photos/seed/shaker1/400/400' },
  { id: 38, name: 'Yoga Blocks Set of 2', category: 'Gym & Fitness', subcategory: 'Yoga', price: 599, originalPrice: 1199, rating: 4.3, reviews: 6543, image: 'https://picsum.photos/seed/yogablock1/400/400' },
  { id: 39, name: 'Battle Rope 30ft Heavy', category: 'Gym & Fitness', subcategory: 'Equipment', price: 3499, originalPrice: 5999, rating: 4.4, reviews: 1234, image: 'https://picsum.photos/seed/rope2/400/400' },
  { id: 40, name: 'BCAA Energy Drink 30 Servings', category: 'Gym & Fitness', subcategory: 'Nutrition', price: 1499, originalPrice: 2499, rating: 4.1, reviews: 3456, image: 'https://picsum.photos/seed/bcaa1/400/400' },

  // Clothes (41-60)
  { id: 41, name: 'Men\'s Slim Fit Cotton Shirt', category: 'Clothes', subcategory: 'Men Topwear', price: 899, originalPrice: 1999, rating: 4.2, reviews: 8765, image: 'https://picsum.photos/seed/shirt1/400/400', badge: '55% Off' },
  { id: 42, name: 'Women\'s Ethnic Kurti Set', category: 'Clothes', subcategory: 'Women Ethnic', price: 1299, originalPrice: 2999, rating: 4.5, reviews: 12345, image: 'https://picsum.photos/seed/kurti1/400/400', badge: 'Bestseller' },
  { id: 43, name: 'Men\'s Jogger Track Pants', category: 'Clothes', subcategory: 'Men Bottomwear', price: 699, originalPrice: 1499, rating: 4.3, reviews: 6789, image: 'https://picsum.photos/seed/jogger1/400/400' },
  { id: 44, name: 'Women\'s High-Waist Jeans', category: 'Clothes', subcategory: 'Women Western', price: 1499, originalPrice: 2999, rating: 4.4, reviews: 9012, image: 'https://picsum.photos/seed/jeans1/400/400', badge: '50% Off' },
  { id: 45, name: 'Men\'s Leather Formal Shoes', category: 'Clothes', subcategory: 'Footwear', price: 2499, originalPrice: 4999, rating: 4.1, reviews: 3456, image: 'https://picsum.photos/seed/shoes1/400/400' },
  { id: 46, name: 'Women\'s Silk Saree Designer', category: 'Clothes', subcategory: 'Women Ethnic', price: 3999, originalPrice: 7999, rating: 4.7, reviews: 5678, image: 'https://picsum.photos/seed/saree1/400/400', badge: 'Premium' },
  { id: 47, name: 'Unisex Oversized Hoodie', category: 'Clothes', subcategory: 'Winter Wear', price: 1199, originalPrice: 2499, rating: 4.5, reviews: 11234, image: 'https://picsum.photos/seed/hoodie1/400/400' },
  { id: 48, name: 'Men\'s Printed Polo T-Shirt', category: 'Clothes', subcategory: 'Men Topwear', price: 599, originalPrice: 1299, rating: 4.2, reviews: 7890, image: 'https://picsum.photos/seed/polo1/400/400' },
  { id: 49, name: 'Women\'s Palazzo Pants Set', category: 'Clothes', subcategory: 'Women Ethnic', price: 999, originalPrice: 1999, rating: 4.3, reviews: 4567, image: 'https://picsum.photos/seed/palazzo1/400/400' },
  { id: 50, name: 'Men\'s Denim Jacket Classic', category: 'Clothes', subcategory: 'Men Outerwear', price: 1999, originalPrice: 3999, rating: 4.4, reviews: 2345, image: 'https://picsum.photos/seed/jacket1/400/400', badge: '50% Off' },
  { id: 51, name: 'Women\'s Running Shoes Nike', category: 'Clothes', subcategory: 'Footwear', price: 4999, originalPrice: 7999, rating: 4.6, reviews: 8901, image: 'https://picsum.photos/seed/shoes2/400/400' },
  { id: 52, name: 'Men\'s Formal Blazer Slim', category: 'Clothes', subcategory: 'Men Outerwear', price: 3499, originalPrice: 6999, rating: 4.3, reviews: 1567, image: 'https://picsum.photos/seed/blazer1/400/400' },
  { id: 53, name: 'Women\'s Crop Top Casual', category: 'Clothes', subcategory: 'Women Western', price: 499, originalPrice: 999, rating: 4.1, reviews: 13456, image: 'https://picsum.photos/seed/croptop1/400/400' },
  { id: 54, name: 'Men\'s Chino Shorts', category: 'Clothes', subcategory: 'Men Bottomwear', price: 799, originalPrice: 1599, rating: 4.2, reviews: 5432, image: 'https://picsum.photos/seed/shorts1/400/400' },
  { id: 55, name: 'Women\'s Anarkali Dress', category: 'Clothes', subcategory: 'Women Ethnic', price: 2499, originalPrice: 4999, rating: 4.6, reviews: 6789, image: 'https://picsum.photos/seed/anarkali1/400/400', badge: 'Trending' },
  { id: 56, name: 'Men\'s Sports Sneakers', category: 'Clothes', subcategory: 'Footwear', price: 2999, originalPrice: 5499, rating: 4.4, reviews: 8901, image: 'https://picsum.photos/seed/sneaker1/400/400' },
  { id: 57, name: 'Women\'s Puffer Jacket', category: 'Clothes', subcategory: 'Winter Wear', price: 2999, originalPrice: 5999, rating: 4.5, reviews: 2345, image: 'https://picsum.photos/seed/puffer1/400/400' },
  { id: 58, name: 'Men\'s Kurta Pajama Set', category: 'Clothes', subcategory: 'Men Ethnic', price: 1499, originalPrice: 2999, rating: 4.3, reviews: 4567, image: 'https://picsum.photos/seed/kurta1/400/400' },
  { id: 59, name: 'Women\'s Leggings High-Waist', category: 'Clothes', subcategory: 'Women Western', price: 599, originalPrice: 1299, rating: 4.2, reviews: 16789, image: 'https://picsum.photos/seed/leggings1/400/400' },
  { id: 60, name: 'Unisex Winter Beanie Cap', category: 'Clothes', subcategory: 'Accessories', price: 399, originalPrice: 799, rating: 4.1, reviews: 7654, image: 'https://picsum.photos/seed/beanie1/400/400' },
];
