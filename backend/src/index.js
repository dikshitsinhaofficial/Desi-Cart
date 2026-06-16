import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the Vercel frontend domain (or all origins in dev)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ── Razorpay Setup ──
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// ── MongoDB Connection & Fallback ──
const MONGO_URI = process.env.MONGO_URI;
let isMongoConnected = false;
let inMemoryProducts = [];
let inMemoryWallet = {
  balance: 0,
  transactions: []
};

// ── Dynamic Product Generator ──
const generateProductsForCategory = (category, count) => {
  const products = [];
  
  const electronicsNames = [
    { name: "Wireless Earbuds", basePrice: 1299, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400" },
    { name: "Smart Fitness Watch", basePrice: 2499, image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400" },
    { name: "Fast Charging Power Bank", basePrice: 999, image: "https://images.unsplash.com/photo-1609592424109-dd7739504c54?w=400" },
    { name: "Portable Bluetooth Speaker", basePrice: 1499, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "Ergonomic Mechanical Keyboard", basePrice: 3499, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" },
    { name: "Gaming Optical Mouse", basePrice: 899, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400" },
    { name: "Type-C Multiport Adapter USB Hub", basePrice: 1199, image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400" },
    { name: "ANC Noise Cancelling Headphones", basePrice: 4999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "Ring Light with Tripod Stand", basePrice: 799, image: "https://images.unsplash.com/photo-1593642532400-2682810df593?w=400" },
    { name: "Adjustable Laptop Cooling Pad", basePrice: 1099, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400" },
    { name: "Smart LED Bulb 9W", basePrice: 399, image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400" },
    { name: "Full HD Webcam with Mic", basePrice: 1999, image: "https://images.unsplash.com/photo-1600541519468-4a74a61448b1?w=400" },
    { name: "Hard Drive External 1TB HDD", basePrice: 3999, image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400" },
    { name: "Solid State Drive SSD 500GB", basePrice: 4599, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
    { name: "Dual-Band Wi-Fi Router", basePrice: 1899, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
    { name: "Wireless Charging Dock", basePrice: 1599, image: "https://images.unsplash.com/photo-1622445262465-2481c8573226?w=400" },
    { name: "Digital Voice Recorder Pen", basePrice: 1299, image: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400" },
    { name: "Mini Projector 1080p Support", basePrice: 6999, image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400" },
    { name: "Grafix Drawing Graphic Tablet", basePrice: 5999, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400" },
    { name: "Smart Plug Wi-Fi Enabled", basePrice: 699, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400" }
  ];

  const fitnessNames = [
    { name: "Non-Slip TPE Yoga Mat", basePrice: 699, image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400" },
    { name: "Adjustable Dumbbells Pair", basePrice: 2999, image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400" },
    { name: "Latex Resistance Bands Set", basePrice: 499, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400" },
    { name: "Cast Iron Kettlebell 8kg", basePrice: 1299, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400" },
    { name: "Digital Jump Skip Rope", basePrice: 299, image: "https://images.unsplash.com/photo-1546483875-0f014e326c48?w=400" },
    { name: "High-Density Foam Roller", basePrice: 599, image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400" },
    { name: "Anti-Burst Gym Fitness Ball", basePrice: 799, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
    { name: "Heavy Duty Push-Up Bars", basePrice: 449, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400" },
    { name: "Double Wheel Ab Roller", basePrice: 399, image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Padded Gym Gloves for Lifting", basePrice: 349, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400" },
    { name: "Insulated Sports Water Bottle", basePrice: 599, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400" },
    { name: "Hand Grip Strengthener", basePrice: 199, image: "https://images.unsplash.com/photo-1591940742878-13aba4b7a35e?w=400" },
    { name: "Fabric Loop Exercise Bands", basePrice: 399, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400" },
    { name: "Ankle Weighted Straps", basePrice: 499, image: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=400" },
    { name: "Foldable Exercise Bench", basePrice: 5499, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400" },
    { name: "Agility Ladder with Cones", basePrice: 699, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400" },
    { name: "Muscle Massage Gun", basePrice: 2499, image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400" },
    { name: "Doorway Pull-Up Chin-Up Bar", basePrice: 1199, image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400" },
    { name: "Under-Desk Walking Pad Treadmill", basePrice: 14999, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400" },
    { name: "Weighted Workout Vest 10kg", basePrice: 2199, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400" }
  ];

  const groceriesNames = [
    { name: "Premium Basmati Rice", basePrice: 149, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Organic Whole Wheat Atta", basePrice: 280, image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400" },
    { name: "Split Toor Dal (Arhar)", basePrice: 160, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400" },
    { name: "Cold Pressed Mustard Oil", basePrice: 199, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
    { name: "Pure Cow Ghee Jar", basePrice: 650, image: "https://images.unsplash.com/photo-1589733901241-5e514f27b51b?w=400" },
    { name: "Organic Turmeric Powder", basePrice: 75, image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400" },
    { name: "Kashmiri Red Chili Powder", basePrice: 99, image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400" },
    { name: "Premium Garam Masala Blend", basePrice: 85, image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400" },
    { name: "Raw Unfiltered Honey", basePrice: 299, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
    { name: "California Almonds Value Pack", basePrice: 399, image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400" },
    { name: "Whole Cashew Nuts (Kaju)", basePrice: 450, image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400" },
    { name: "Organic Jaggery Powder (Gur)", basePrice: 90, image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400" },
    { name: "Pistachios Roasted & Salted", basePrice: 420, image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400" },
    { name: "Green Cardamom (Elaichi)", basePrice: 180, image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400" },
    { name: "Cloves Whole Spice (Laung)", basePrice: 110, image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400" },
    { name: "Premium Tea Leaves Assam", basePrice: 249, image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400" },
    { name: "Filter Coffee Powder Blend", basePrice: 280, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400" },
    { name: "Himalayan Pink Salt Fine", basePrice: 65, image: "https://images.unsplash.com/photo-1604838605657-622c366ff809?w=400" },
    { name: "Organic Brown Sugar", basePrice: 120, image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400" },
    { name: "Saffron Threads Kesar (1g)", basePrice: 350, image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400" }
  ];

  const foodNames = [
    { name: "Masala Potato Chips Crunchy", basePrice: 40, image: "https://images.unsplash.com/photo-1566478989037-eec170784d20?w=400" },
    { name: "Roasted Makhana Herbs & Spices", basePrice: 120, image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=400" },
    { name: "Double Choco Chip Cookies", basePrice: 99, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
    { name: "Instant Poha Ready Mix", basePrice: 60, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400" },
    { name: "Diet Methi Khakhra Crispy", basePrice: 85, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400" },
    { name: "Crunchy Peanut Chikki Bars", basePrice: 75, image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400" },
    { name: "Assorted Mithai Sweets Box", basePrice: 499, image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400" },
    { name: "Spicy Baked Bhujia Sev", basePrice: 45, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400" },
    { name: "Mango Pickle Homemade Style", basePrice: 140, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400" },
    { name: "Mixed Fruit Jam Spread", basePrice: 115, image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400" },
    { name: "Salted Roasted Peanuts Pack", basePrice: 50, image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400" },
    { name: "Instant Oats Tomato Masala", basePrice: 130, image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400" },
    { name: "Veg Hakka Noodles Kit", basePrice: 95, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400" },
    { name: "Dark Chocolate Premium Bar", basePrice: 150, image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400" },
    { name: "Sweet Corn Soup Instant", basePrice: 45, image: "https://images.unsplash.com/photo-1547592165-e1d17f1a0655?w=400" },
    { name: "Tomato Ketchup Squeezy Bottle", basePrice: 120, image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?w=400" },
    { name: "Ready-to-Eat Dal Makhani", basePrice: 110, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400" },
    { name: "Ready-to-Eat Paneer Butter Masala", basePrice: 140, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
    { name: "Premium Popcorn Kernel Pack", basePrice: 65, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400" },
    { name: "Crispy Soya Sticks Snack", basePrice: 55, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400" }
  ];

  const clothingNames = [
    { name: "Classic Cotton Kurta Men", basePrice: 699, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
    { name: "Comfort Fit Crewneck T-Shirt", basePrice: 399, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400" },
    { name: "Stretchable Slim Fit Chinos", basePrice: 1299, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400" },
    { name: "Classic Indigo Denim Jacket", basePrice: 1899, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400" },
    { name: "Breezy Linen Casual Shirt", basePrice: 999, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "Traditional Silk Saree Elegant", basePrice: 2499, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Printed Floral Summer Dress", basePrice: 1199, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
    { name: "Active Dry-Fit Sports T-Shirt", basePrice: 499, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400" },
    { name: "High-Waist Stretch Denim Jeans", basePrice: 1499, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Casual Fleece Pullover Hoodie", basePrice: 1099, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400" },
    { name: "Premium Silk Dupatta Scarves", basePrice: 599, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Slim Fit Formal Cotton Trousers", basePrice: 1199, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400" },
    { name: "Comfortable Joggers Track Pants", basePrice: 799, image: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=400" },
    { name: "Cargo Utility Pants 6-Pocket", basePrice: 1399, image: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=400" },
    { name: "Solid Polo Shirt Collar Neck", basePrice: 599, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400" },
    { name: "Casual Denim Shorts Rugged", basePrice: 699, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400" },
    { name: "Georgette Floral Printed Kurti", basePrice: 899, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
    { name: "Woolen Blend Knit Winter Sweater", basePrice: 1299, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400" },
    { name: "Unisex Cotton Socks Pack of 5", basePrice: 299, image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400" },
    { name: "Classic Leather Belt Formal", basePrice: 499, image: "https://images.unsplash.com/photo-1624222247344-550fb8ecfbd4?w=400" }
  ];

  let itemsPool = [];
  let brands = [];
  if (category === "Electronics") {
    itemsPool = electronicsNames;
    brands = ["Apple", "Samsung", "Sony", "Bose", "JBL", "Dell", "HP", "Lenovo", "ASUS", "OnePlus"];
  } else if (category === "Fitness") {
    itemsPool = fitnessNames;
    brands = ["Nike", "Adidas", "Puma", "Reebok", "Under Armour", "Decathlon", "Optimum Nutrition", "MuscleBlaze", "CultSport"];
  } else if (category === "Groceries") {
    itemsPool = groceriesNames;
    brands = ["Tata Sampann", "Aashirvaad", "Fortune", "India Gate", "Daawat", "Saffola", "Everest", "MDH", "Catch"];
  } else if (category === "Food") {
    itemsPool = foodNames;
    brands = ["Haldiram's", "Bikanervala", "Britannia", "Parle", "ITC Sunfeast", "Lay's", "Kurkure", "Cadbury", "Nestle"];
  } else if (category === "Clothing") {
    itemsPool = clothingNames;
    brands = ["Levi's", "Zara", "H&M", "FabIndia", "Biba", "Manyavar", "Allen Solly", "Peter England", "Raymond"];
  }
  const descriptions = [
    "High quality authentic product designed for daily use and durability.",
    "Made with premium materials. Specially curated for our valued customers.",
    "Experience the comfort and reliability of this handcrafted select item.",
    "Top rated product featuring advanced craftsmanship and standard specifications.",
    "Brought to you by top local sellers. Trusted by thousands of happy customers.",
    "Perfect choice for modern lifestyle. Safe, eco-friendly, and highly efficient."
  ];
  
  const sellers = ["Dhanraj", "Vedic Stores", "Bharat Traders", "IndiRetail", "Swadeshi Co.", "Aura Sellers"];

  for (let i = 0; i < count; i++) {
    const baseItem = itemsPool[i % itemsPool.length];
    const brand = brands[Math.floor((i * 7 + 13) % brands.length)];
    const desc = descriptions[Math.floor((i * 11 + 3) % descriptions.length)];
    const seller = sellers[Math.floor((i * 3 + 2) % sellers.length)];
    
    const variationMultiplier = 0.9 + ((i * 17) % 21) * 0.01;
    const price = Math.round(baseItem.basePrice * variationMultiplier);
    const mrp = Math.round(price * (1.2 + ((i * 13) % 4) * 0.1));
    const rating = parseFloat((4.0 + ((i * 9) % 11) * 0.1).toFixed(1));
    const reviews = Math.round(15 + (i * 23) % 850);
    
    const numStr = (i + 1).toString().padStart(3, '0');
    // Using a more realistic naming convention for branded products
    const name = `${brand} ${baseItem.name}`;
    
    products.push({
      name,
      category,
      price,
      mrp,
      description: `${desc} Features unique specifications and reliable build.`,
      sellerName: seller,
      rating,
      reviews,
      image: baseItem.image
    });
  }

  return products;
};

const generateAllSeedProducts = () => {
  const categories = ["Electronics", "Fitness", "Groceries", "Food", "Clothing"];
  let all = [];
  categories.forEach(cat => {
    all = all.concat(generateProductsForCategory(cat, 40));
  });
  return all;
};

const seedInMemory = () => {
  const seedItems = generateAllSeedProducts();
  inMemoryProducts = seedItems.map((p, idx) => ({
    _id: `m_${idx + 1}`,
    ...p
  }));
  console.log(`In-memory database seeded with ${inMemoryProducts.length} initial products.`);
};

seedInMemory();

if (!MONGO_URI || MONGO_URI.includes('<db_password>')) {
  console.error('ERROR: Please replace <db_password> in your .env file with your actual database password!');
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    isMongoConnected = true;
    console.log('Connected to MongoDB Atlas');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB Connection Error. Falling back to In-Memory DB:', err.message);
  });

// ── Models ──
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  description: { type: String },
  sellerName: { type: String, default: 'Anonymous Seller' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

const walletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  transactions: [{
    amount: Number,
    type: { type: String, enum: ['topup', 'purchase'] },
    status: String,
    date: { type: Date, default: Date.now }
  }]
});
const Wallet = mongoose.model('Wallet', walletSchema);

// ── Seeding Logic ──
const seedDatabase = async () => {
  try {
    // Delete existing products to ensure a clean seed of requested categories
    await Product.deleteMany({});
    const seedItems = generateAllSeedProducts();
    await Product.insertMany(seedItems);
    console.log(`Database seeded with ${seedItems.length} products successfully.`);
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

// ── API Routes ──

// GET Wallet Balance
app.get('/api/wallet', async (req, res) => {
  try {
    if (isMongoConnected) {
      let wallet = await Wallet.findOne();
      if (!wallet) {
        wallet = new Wallet({ balance: 0 });
        await wallet.save();
      }
      res.json(wallet);
    } else {
      res.json(inMemoryWallet);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Create Razorpay Order for Wallet Top-up
app.post('/api/wallet/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_topup_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Payment and Update Wallet
app.post('/api/wallet/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    if (isMongoConnected) {
      let wallet = await Wallet.findOne();
      if (!wallet) wallet = new Wallet({ balance: 0 });
      
      wallet.balance += Number(amount);
      wallet.transactions.push({ amount, type: 'topup', status: 'success' });
      await wallet.save();
      
      res.json({ success: true, balance: wallet.balance });
    } else {
      inMemoryWallet.balance += Number(amount);
      inMemoryWallet.transactions.push({ amount, type: 'topup', status: 'success', date: new Date() });
      res.json({ success: true, balance: inMemoryWallet.balance });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// Create Razorpay Order for Checkout
app.post('/api/checkout/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_checkout_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkout payment order' });
  }
});

// Verify Checkout Payment
app.post('/api/checkout/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    if (isMongoConnected) {
      let wallet = await Wallet.findOne();
      if (!wallet) wallet = new Wallet({ balance: 0 });
      wallet.transactions.push({ amount: Number(amount) || 0, type: 'purchase', status: 'success' });
      await wallet.save();
    } else {
      inMemoryWallet.transactions.push({ amount: Number(amount) || 0, type: 'purchase', status: 'success', date: new Date() });
    }
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// Pay with Wallet Route
app.post('/api/checkout/pay-with-wallet', async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }
  try {
    if (isMongoConnected) {
      let wallet = await Wallet.findOne();
      if (!wallet) {
        wallet = new Wallet({ balance: 0 });
        await wallet.save();
      }

      if (wallet.balance < Number(amount)) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }

      wallet.balance -= Number(amount);
      wallet.transactions.push({
        amount: Number(amount),
        type: 'purchase',
        status: 'success',
        date: new Date()
      });
      await wallet.save();
      res.json({ success: true, balance: wallet.balance, message: 'Payment successful using wallet!' });
    } else {
      if (inMemoryWallet.balance < Number(amount)) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }

      inMemoryWallet.balance -= Number(amount);
      inMemoryWallet.transactions.push({
        amount: Number(amount),
        type: 'purchase',
        status: 'success',
        date: new Date()
      });
      res.json({ success: true, balance: inMemoryWallet.balance, message: 'Payment successful using wallet!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to process wallet payment' });
  }
});


// GET all products
app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  try {
    if (isMongoConnected) {
      const filter = category ? { category } : {};
      const products = await Product.find(filter);
      res.json(products);
    } else {
      const products = category
        ? inMemoryProducts.filter(p => p.category === category)
        : inMemoryProducts;
      res.json(products);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST add a new product
app.post('/api/products', async (req, res) => {
  const { name, category, price, mrp, description, sellerName } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Required fields missing' });
  try {
    if (isMongoConnected) {
      const product = new Product({ name, category, price, mrp, description, sellerName });
      await product.save();
      res.status(201).json(product);
    } else {
      const product = {
        _id: `m_${Date.now()}`,
        name,
        category,
        price: Number(price),
        mrp: Number(mrp) || Math.round(Number(price) * 1.3),
        description,
        sellerName: sellerName || 'Anonymous Seller',
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString()
      };
      inMemoryProducts.push(product);
      res.status(201).json(product);
    }
  } catch (err) { res.status(500).json({ error: 'Failed to add product' }); }
});

// DELETE a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted' });
    } else {
      inMemoryProducts = inMemoryProducts.filter(p => p._id !== req.params.id);
      res.json({ message: 'Product deleted' });
    }
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

// GET admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (isMongoConnected) {
      const productCount = await Product.countDocuments();
      const wallet = await Wallet.findOne();
      const totalRevenue = wallet
        ? wallet.transactions
            .filter(t => t.type === 'purchase' && t.status === 'success')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
        : 0;
      const uniqueSellers = await Product.distinct('sellerName');
      res.json({
        productCount,
        totalRevenue,
        sellerCount: uniqueSellers.length,
        storeCount: uniqueSellers.length,
      });
    } else {
      const productCount = inMemoryProducts.length;
      const totalRevenue = inMemoryWallet.transactions
        .filter(t => t.type === 'purchase' && t.status === 'success')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const uniqueSellers = Array.from(new Set(inMemoryProducts.map(p => p.sellerName)));
      res.json({
        productCount,
        totalRevenue,
        sellerCount: uniqueSellers.length,
        storeCount: uniqueSellers.length,
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET seller stats
app.get('/api/seller/stats', async (req, res) => {
  try {
    if (isMongoConnected) {
      const productCount = await Product.countDocuments();
      res.json({ productCount, activeOrders: 0, totalSales: 0 });
    } else {
      const productCount = inMemoryProducts.length;
      res.json({ productCount, activeOrders: 0, totalSales: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seller stats' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Desi-Cart API with Razorpay and Wallet is live...');
});

// Only start a local HTTP server when NOT running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app;

