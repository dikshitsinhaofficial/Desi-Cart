import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('<db_password>')) {
  console.error('ERROR: Please replace <db_password> in your .env file with your actual database password!');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ── Product Model ──
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

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'name, category and price are required' });
  }

  try {
    const product = new Product({
      name,
      category,
      price: Number(price),
      mrp: Number(mrp) || Number(price),
      description,
      sellerName
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// DELETE a product by id
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Desi-Cart API is running with MongoDB persistence...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


