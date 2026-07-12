import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Use path resolution to load the .env file from the root
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Since we are running outside Next.js, we should connect directly
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI is missing in .env');
  process.exit(1);
}

// Minimal Product schema for the seed script
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  description: { type: String },
  sellerName: { type: String, default: 'Anonymous Seller' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  reviewList: [{
    user: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

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

async function runSeed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB.');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`⚠️ DB already has ${count} products. Skipping seed to prevent duplicates.`);
      process.exit(0);
    }

    console.log('⏳ Generating products...');
    const products = generateSeedProducts();
    
    console.log(`⏳ Inserting ${products.length} products...`);
    await Product.insertMany(products);
    
    console.log(`✅ Successfully seeded ${products.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
