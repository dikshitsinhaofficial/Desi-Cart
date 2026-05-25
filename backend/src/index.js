import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
    { name: "Wireless Earbuds", basePrice: 1299 },
    { name: "Smart Fitness Watch", basePrice: 2499 },
    { name: "Fast Charging Power Bank", basePrice: 999 },
    { name: "Portable Bluetooth Speaker", basePrice: 1499 },
    { name: "Ergonomic Mechanical Keyboard", basePrice: 3499 },
    { name: "Gaming Optical Mouse", basePrice: 899 },
    { name: "Type-C Multiport Adapter USB Hub", basePrice: 1199 },
    { name: "ANC Noise Cancelling Headphones", basePrice: 4999 },
    { name: "Ring Light with Tripod Stand", basePrice: 799 },
    { name: "Adjustable Laptop Cooling Pad", basePrice: 1099 },
    { name: "Smart LED Bulb 9W", basePrice: 399 },
    { name: "Full HD Webcam with Mic", basePrice: 1999 },
    { name: "Hard Drive External 1TB HDD", basePrice: 3999 },
    { name: "Solid State Drive SSD 500GB", basePrice: 4599 },
    { name: "Dual-Band Wi-Fi Router", basePrice: 1899 },
    { name: "Wireless Charging Dock", basePrice: 1599 },
    { name: "Digital Voice Recorder Pen", basePrice: 1299 },
    { name: "Mini Projector 1080p Support", basePrice: 6999 },
    { name: "Grafix Drawing Graphic Tablet", basePrice: 5999 },
    { name: "Smart Plug Wi-Fi Enabled", basePrice: 699 }
  ];

  const fitnessNames = [
    { name: "Non-Slip TPE Yoga Mat", basePrice: 699 },
    { name: "Adjustable Dumbbells Pair", basePrice: 2999 },
    { name: "Latex Resistance Bands Set", basePrice: 499 },
    { name: "Cast Iron Kettlebell 8kg", basePrice: 1299 },
    { name: "Digital Jump Skip Rope", basePrice: 299 },
    { name: "High-Density Foam Roller", basePrice: 599 },
    { name: "Anti-Burst Gym Fitness Ball", basePrice: 799 },
    { name: "Heavy Duty Push-Up Bars", basePrice: 449 },
    { name: "Double Wheel Ab Roller", basePrice: 399 },
    { name: "Padded Gym Gloves for Lifting", basePrice: 349 },
    { name: "Insulated Sports Water Bottle", basePrice: 599 },
    { name: "Hand Grip Strengthener", basePrice: 199 },
    { name: "Fabric Loop Exercise Bands", basePrice: 399 },
    { name: "Ankle Weighted Straps", basePrice: 499 },
    { name: "Foldable Exercise Bench", basePrice: 5499 },
    { name: "Agility Ladder with Cones", basePrice: 699 },
    { name: "Muscle Massage Gun", basePrice: 2499 },
    { name: "Doorway Pull-Up Chin-Up Bar", basePrice: 1199 },
    { name: "Under-Desk Walking Pad Treadmill", basePrice: 14999 },
    { name: "Weighted Workout Vest 10kg", basePrice: 2199 }
  ];

  const groceriesNames = [
    { name: "Premium Basmati Rice", basePrice: 149 },
    { name: "Organic Whole Wheat Atta", basePrice: 280 },
    { name: "Split Toor Dal (Arhar)", basePrice: 160 },
    { name: "Cold Pressed Mustard Oil", basePrice: 199 },
    { name: "Pure Cow Ghee Jar", basePrice: 650 },
    { name: "Organic Turmeric Powder", basePrice: 75 },
    { name: "Kashmiri Red Chili Powder", basePrice: 99 },
    { name: "Premium Garam Masala Blend", basePrice: 85 },
    { name: "Raw Unfiltered Honey", basePrice: 299 },
    { name: "California Almonds Value Pack", basePrice: 399 },
    { name: "Whole Cashew Nuts (Kaju)", basePrice: 450 },
    { name: "Organic Jaggery Powder (Gur)", basePrice: 90 },
    { name: "Pistachios Roasted & Salted", basePrice: 420 },
    { name: "Green Cardamom (Elaichi)", basePrice: 180 },
    { name: "Cloves Whole Spice (Laung)", basePrice: 110 },
    { name: "Premium Tea Leaves Assam", basePrice: 249 },
    { name: "Filter Coffee Powder Blend", basePrice: 280 },
    { name: "Himalayan Pink Salt Fine", basePrice: 65 },
    { name: "Organic Brown Sugar", basePrice: 120 },
    { name: "Saffron Threads Kesar (1g)", basePrice: 350 }
  ];

  const foodNames = [
    { name: "Masala Potato Chips Crunchy", basePrice: 40 },
    { name: "Roasted Makhana Herbs & Spices", basePrice: 120 },
    { name: "Double Choco Chip Cookies", basePrice: 99 },
    { name: "Instant Poha Ready Mix", basePrice: 60 },
    { name: "Diet Methi Khakhra Crispy", basePrice: 85 },
    { name: "Crunchy Peanut Chikki Bars", basePrice: 75 },
    { name: "Assorted Mithai Sweets Box", basePrice: 499 },
    { name: "Spicy Baked Bhujia Sev", basePrice: 45 },
    { name: "Mango Pickle Homemade Style", basePrice: 140 },
    { name: "Mixed Fruit Jam Spread", basePrice: 115 },
    { name: "Salted Roasted Peanuts Pack", basePrice: 50 },
    { name: "Instant Oats Tomato Masala", basePrice: 130 },
    { name: "Veg Hakka Noodles Kit", basePrice: 95 },
    { name: "Dark Chocolate Premium Bar", basePrice: 150 },
    { name: "Sweet Corn Soup Instant", basePrice: 45 },
    { name: "Tomato Ketchup Squeezy Bottle", basePrice: 120 },
    { name: "Ready-to-Eat Dal Makhani", basePrice: 110 },
    { name: "Ready-to-Eat Paneer Butter Masala", basePrice: 140 },
    { name: "Premium Popcorn Kernel Pack", basePrice: 65 },
    { name: "Crispy Soya Sticks Snack", basePrice: 55 }
  ];

  const clothingNames = [
    { name: "Classic Cotton Kurta Men", basePrice: 699 },
    { name: "Comfort Fit Crewneck T-Shirt", basePrice: 399 },
    { name: "Stretchable Slim Fit Chinos", basePrice: 1299 },
    { name: "Classic Indigo Denim Jacket", basePrice: 1899 },
    { name: "Breezy Linen Casual Shirt", basePrice: 999 },
    { name: "Traditional Silk Saree Elegant", basePrice: 2499 },
    { name: "Printed Floral Summer Dress", basePrice: 1199 },
    { name: "Active Dry-Fit Sports T-Shirt", basePrice: 499 },
    { name: "High-Waist Stretch Denim Jeans", basePrice: 1499 },
    { name: "Casual Fleece Pullover Hoodie", basePrice: 1099 },
    { name: "Premium Silk Dupatta Scarves", basePrice: 599 },
    { name: "Slim Fit Formal Cotton Trousers", basePrice: 1199 },
    { name: "Comfortable Joggers Track Pants", basePrice: 799 },
    { name: "Cargo Utility Pants 6-Pocket", basePrice: 1399 },
    { name: "Solid Polo Shirt Collar Neck", basePrice: 599 },
    { name: "Casual Denim Shorts Rugged", basePrice: 699 },
    { name: "Georgette Floral Printed Kurti", basePrice: 899 },
    { name: "Woolen Blend Knit Winter Sweater", basePrice: 1299 },
    { name: "Unisex Cotton Socks Pack of 5", basePrice: 299 },
    { name: "Classic Leather Belt Formal", basePrice: 499 }
  ];

  let itemsPool = [];
  if (category === "Electronics") itemsPool = electronicsNames;
  else if (category === "Fitness") itemsPool = fitnessNames;
  else if (category === "Groceries") itemsPool = groceriesNames;
  else if (category === "Food") itemsPool = foodNames;
  else if (category === "Clothing") itemsPool = clothingNames;

  const brands = ["Bharat", "Desi", "Vedic", "Royal", "Indi", "Classic", "Premium", "Heritage", "Elite", "Urban"];
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
    const name = `${brand} ${baseItem.name} v${numStr}`;
    
    products.push({
      name,
      category,
      price,
      mrp,
      description: `${desc} Features unique specifications and reliable build.`,
      sellerName: seller,
      rating,
      reviews
    });
  }

  return products;
};

const generateAllSeedProducts = () => {
  const categories = ["Electronics", "Fitness", "Groceries", "Food", "Clothing"];
  let all = [];
  categories.forEach(cat => {
    all = all.concat(generateProductsForCategory(cat, 100));
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

