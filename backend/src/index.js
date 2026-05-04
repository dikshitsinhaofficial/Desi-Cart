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

// ── MongoDB Connection ──
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('<db_password>')) {
  console.error('ERROR: Please replace <db_password> in your .env file with your actual database password!');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Connection Error:', err));

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
    const count = await Product.countDocuments();
    if (count === 0) {
      const initialProducts = [
        { name: "Men's Cotton Casual Shirt", category: "Fashion", price: 899, mrp: 1499, description: "Comfortable pure cotton shirt for daily wear.", sellerName: "Dhanraj", rating: 4.2, reviews: 120 },
        { name: "Women's Floral Summer Dress", category: "Fashion", price: 1299, mrp: 2499, description: "Breezy floral dress perfect for summer outings.", sellerName: "Dhanraj", rating: 4.5, reviews: 340 },
        { name: "Unisex Denim Jacket", category: "Fashion", price: 1999, mrp: 3999, description: "Classic blue denim jacket with a modern fit.", sellerName: "Dhanraj", rating: 4.7, reviews: 890 },
        { name: "Men's Slim Fit Chinos", category: "Fashion", price: 1099, mrp: 1999, description: "Stretchable slim fit chinos for office and casual wear.", sellerName: "Dhanraj", rating: 4.1, reviews: 45 },
        { name: "Women's Ethnic Kurti", category: "Fashion", price: 799, mrp: 1299, description: "Beautiful printed kurti with traditional motifs.", sellerName: "Dhanraj", rating: 4.4, reviews: 210 },
        { name: "Men's Sports T-Shirt", category: "Fashion", price: 499, mrp: 999, description: "Dry-fit activewear t-shirt for workouts.", sellerName: "Dhanraj", rating: 4.6, reviews: 560 },
        { name: "Women's High-Waist Jeans", category: "Fashion", price: 1499, mrp: 2999, description: "Trendy high-waist denim jeans with a flattering fit.", sellerName: "Dhanraj", rating: 4.3, reviews: 150 },
        { name: "Unisex Winter Hoodie", category: "Fashion", price: 1199, mrp: 2499, description: "Warm and cozy fleece hoodie with front pocket.", sellerName: "Dhanraj", rating: 4.8, reviews: 1020 },
        { name: "Men's Formal Trousers", category: "Fashion", price: 1299, mrp: 2199, description: "Premium fabric formal trousers for business wear.", sellerName: "Dhanraj", rating: 4.2, reviews: 85 },
        { name: "Women's Silk Saree", category: "Fashion", price: 3499, mrp: 5999, description: "Elegant silk saree with intricate zari border.", sellerName: "Dhanraj", rating: 4.9, reviews: 430 }
      ];
      await Product.insertMany(initialProducts);
      console.log('Database seeded with initial products.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedDatabase();

// ── API Routes ──

// GET Wallet Balance
app.get('/api/wallet', async (req, res) => {
  let wallet = await Wallet.findOne();
  if (!wallet) {
    wallet = new Wallet({ balance: 0 });
    await wallet.save();
  }
  res.json(wallet);
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
    let wallet = await Wallet.findOne();
    if (!wallet) wallet = new Wallet({ balance: 0 });
    
    wallet.balance += Number(amount);
    wallet.transactions.push({ amount, type: 'topup', status: 'success' });
    await wallet.save();
    
    res.json({ success: true, balance: wallet.balance });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// Create Razorpay Order for Checkout
app.post('/api/checkout/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// GET all products
app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  try {
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST add a new product
app.post('/api/products', async (req, res) => {
  const { name, category, price, mrp, description, sellerName } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Required fields missing' });
  try {
    const product = new Product({ name, category, price, mrp, description, sellerName });
    await product.save();
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ error: 'Failed to add product' }); }
});

// DELETE a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

// Health check
app.get('/', (req, res) => {
  res.send('Desi-Cart API with Razorpay and Wallet is live...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
