import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

// Seed data generator (mirrors the old express seeder)
const CATEGORIES = [
  'Mobile Phones', 'Laptops & Accessories', 'Audio & Watches', 'Home & Kitchen',
  "Women's Clothing", "Men's Clothing", 'Gym Equipment', 'Food & Groceries',
  'Books & Stationery', 'Toys & Games', 'Beauty & Skincare', 'Automotive',
  'Sports & Outdoors', 'Beverages', 'Pet Supplies'
];

const brands: Record<string, string[]> = {
  'Mobile Phones': ['Samsung', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Apple', 'Nothing'],
  'Laptops & Accessories': ['Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Apple', 'MSI'],
  'Audio & Watches': ['boAt', 'JBL', 'Sony', 'Noise', 'Fire-Boltt', 'Amazfit', 'Fastrack'],
  'Home & Kitchen': ['Prestige', 'Philips', 'Havells', 'Bajaj', 'Kent', 'Pigeon'],
  "Women's Clothing": ['Libas', 'Biba', 'W', 'FabIndia', 'Aurelia', 'Global Desi'],
  "Men's Clothing": ['Roadster', 'Allen Solly', 'Peter England', 'Van Heusen', 'Arrow'],
  'Gym Equipment': ['Decathlon', 'Cosco', 'Nivia', 'Protoner', 'Kore', 'Body Maxx'],
  'Food & Groceries': ['Amul', 'Nestle', 'Britannia', 'Haldiram', 'Patanjali', 'ITC'],
  'Books & Stationery': ['Classmate', 'Natraj', 'Camlin', 'Reynolds', 'Staples'],
  'Toys & Games': ['Lego', 'Funskool', 'Hasbro', 'Fisher-Price', 'Mattel'],
  'Beauty & Skincare': ['Lakme', 'Lotus', 'Mamaearth', 'Wow', 'Biotique', 'Forest Essentials'],
  'Automotive': ['Bosch', 'Exide', 'Amaron', 'Vega', 'Studds', 'Steelbird'],
  'Sports & Outdoors': ['Yonex', 'SG', 'Reebok', 'Nike', 'Adidas', 'Puma'],
  'Beverages': ['Red Bull', 'Paper Boat', 'Dabur', 'Tropicana', 'Real', 'Minute Maid'],
  'Pet Supplies': ['Pedigree', 'Whiskas', 'Royal Canin', 'Drools', 'Me-O'],
};

function generateSeedProducts() {
  const products: any[] = [];
  CATEGORIES.forEach(cat => {
    const catBrands = brands[cat] || ['DesiCart'];
    for (let i = 0; i < 15; i++) {
      const brand = catBrands[i % catBrands.length];
      let minPrice = 99, maxPrice = 4900;
      if (cat === 'Mobile Phones' || cat === 'Laptops & Accessories') { minPrice = 5000; maxPrice = 95000; }
      else if (cat === 'Audio & Watches') { minPrice = 999; maxPrice = 25000; }
      else if (cat === 'Food & Groceries' || cat === 'Beverages') { minPrice = 20; maxPrice = 900; }
      const price = Math.floor(Math.random() * (maxPrice - minPrice)) + minPrice;
      const mrp = Math.round(price * (1.15 + Math.random() * 0.35));
      products.push({
        name: `${brand} ${cat.split(' ')[0]} ${String.fromCharCode(65 + i)}${i + 100}`,
        category: cat,
        price,
        mrp,
        description: `Premium ${cat.toLowerCase()} product by ${brand}. High quality, reliable performance.`,
        sellerName: `${brand} Official Store`,
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 800) + 10,
        image: `https://picsum.photos/seed/${brand.replace(/\s/g, '')}_${i}/400/400`,
        reviewList: []
      });
    }
  });
  return products;
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const count = await Product.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: `DB already has ${count} products — seed skipped.`, count });
    }

    const products = generateSeedProducts();
    await Product.insertMany(products);
    return NextResponse.json({ message: `Seeded ${products.length} products successfully.`, count: products.length });
  } catch (err) {
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
