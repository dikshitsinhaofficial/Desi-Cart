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

// ── Dynamic Product Generator (750 products, 15 categories, 50 items each) ──
const generateAllSeedProducts = () => {
  const categories = [
    "Men's Clothing", "Women's Clothing", "Shoes", "Mobile Phones", 
    "Laptops & Accessories", "Audio & Watches", "Gym Equipment", 
    "Sports Outdoors", "Food & Groceries", "Beverages", 
    "Home Decor", "Beauty & Personal Care", "Toys & Games", 
    "Books", "Pet Supplies"
  ];

  const brands = {
    "Men's Clothing": ["Levi's", "Nike", "Adidas", "Puma", "Zara", "H&M", "Raymond", "Tommy Hilfiger", "Calvin Klein", "Wrangler"],
    "Women's Clothing": ["Zara", "H&M", "Biba", "FabIndia", "Vero Moda", "Forever 21", "Mango", "Gucci", "Prada", "Chanel"],
    "Shoes": ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Vans", "Converse", "Skechers", "Bata", "Woodland"],
    "Mobile Phones": ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Vivo", "Oppo", "Realme", "Motorola", "Nothing"],
    "Laptops & Accessories": ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "Razer", "MSI", "Logitech"],
    "Audio & Watches": ["Sony", "Bose", "Sennheiser", "JBL", "Apple", "Samsung", "Garmin", "Fossil", "Casio", "Rolex"],
    "Gym Equipment": ["Decathlon", "Bowflex", "NordicTrack", "Golds Gym", "Rogue", "ProForm", "TRX", "Peloton", "Everlast", "Bodycraft"],
    "Sports Outdoors": ["Decathlon", "Columbia", "The North Face", "Patagonia", "Salomon", "Yonex", "Spalding", "Wilson", "Coleman", "Nivia"],
    "Food & Groceries": ["Nestle", "Amul", "Britannia", "ITC", "Parle", "Tata", "Haldiram's", "Kellogg's", "Cadbury", "Patanjali"],
    "Beverages": ["Coca-Cola", "Pepsi", "Red Bull", "Monster", "Nescafe", "Bru", "Lipton", "Taj Mahal", "Paper Boat", "Tropicana"],
    "Home Decor": ["IKEA", "Home Centre", "Bombay Dyeing", "Pepperfry", "Urban Ladder", "D'Decor", "Chumbak", "Wakefit", "FabIndia", "Swayam"],
    "Beauty & Personal Care": ["L'Oreal", "Maybelline", "MAC", "Lakme", "Nykaa", "The Body Shop", "Plum", "Mamaearth", "Dove", "Nivea"],
    "Toys & Games": ["LEGO", "Hasbro", "Mattel", "Hot Wheels", "Barbie", "Fisher-Price", "Nerf", "Funko", "Bandai", "Play-Doh"],
    "Books": ["Penguin", "HarperCollins", "Scholastic", "Bloomsbury", "Pan Macmillan", "Simon & Schuster", "Rupa", "Oxford", "Pearson", "Arihant"],
    "Pet Supplies": ["Pedigree", "Whiskas", "Royal Canin", "Drools", "Purina", "Himalaya", "Meat Up", "Purepet", "Kong", "Wahl"]
  };

  const types = {
    "Men's Clothing": ["T-Shirt", "Jeans", "Jacket", "Shirt", "Trousers", "Shorts", "Hoodie", "Sweater", "Suit", "Kurta"],
    "Women's Clothing": ["Dress", "Top", "Jeans", "Skirt", "Jacket", "Saree", "Kurti", "Leggings", "Sweater", "Gown"],
    "Shoes": ["Sneakers", "Running Shoes", "Formal Shoes", "Boots", "Sandals", "Loafers", "Slippers", "Training Shoes", "Trekking Shoes", "Oxfords"],
    "Mobile Phones": ["Smartphone", "Pro Smartphone", "Lite Smartphone", "Foldable Phone", "Gaming Phone", "5G Phone", "Camera Phone", "Business Phone", "Flagship Phone", "Budget Phone"],
    "Laptops & Accessories": ["Laptop", "Gaming Laptop", "Ultrabook", "Wireless Mouse", "Mechanical Keyboard", "Monitor", "Webcam", "Laptop Bag", "Cooling Pad", "USB Hub"],
    "Audio & Watches": ["Wireless Earbuds", "Over-Ear Headphones", "Smartwatch", "Analog Watch", "Bluetooth Speaker", "Soundbar", "Digital Watch", "Fitness Band", "Gaming Headset", "Chronograph Watch"],
    "Gym Equipment": ["Dumbbells", "Yoga Mat", "Kettlebell", "Resistance Bands", "Treadmill", "Exercise Bike", "Pull-up Bar", "Weight Bench", "Punching Bag", "Jump Rope"],
    "Sports Outdoors": ["Basketball", "Football", "Tennis Racket", "Cricket Bat", "Camping Tent", "Sleeping Bag", "Badminton Racket", "Hiking Backpack", "Skateboard", "Cycling Helmet"],
    "Food & Groceries": ["Basmati Rice", "Whole Wheat Atta", "Olive Oil", "Mixed Nuts", "Pasta", "Organic Honey", "Dark Chocolate", "Oats", "Muesli", "Peanut Butter"],
    "Beverages": ["Instant Coffee", "Green Tea", "Energy Drink", "Fruit Juice", "Sparkling Water", "Cold Coffee", "Black Tea", "Lemon Iced Tea", "Protein Shake", "Almond Milk"],
    "Home Decor": ["Ceramic Vase", "Wall Art", "Cushion Cover", "Table Lamp", "Scented Candles", "Indoor Plant", "Wall Clock", "Area Rug", "Photo Frame", "Curtains"],
    "Beauty & Personal Care": ["Face Wash", "Moisturizer", "Lipstick", "Shampoo", "Body Lotion", "Perfume", "Sunscreen", "Hair Oil", "Conditioner", "Face Serum"],
    "Toys & Games": ["Board Game", "Building Blocks", "Action Figure", "Remote Control Car", "Puzzle", "Plush Toy", "Card Game", "Doll", "Toy Train", "Educational Toy"],
    "Books": ["Mystery Novel", "Science Fiction Book", "Biography", "Self-Help Book", "Cookbook", "History Book", "Fantasy Novel", "Business Book", "Children's Book", "Poetry Collection"],
    "Pet Supplies": ["Dry Dog Food", "Cat Litter", "Pet Bed", "Dog Toys", "Cat Scratching Post", "Pet Grooming Brush", "Dog Collar", "Fish Food", "Bird Seed", "Pet Carrier"]
  };

  const adjectives = ["Premium", "Elite", "Pro", "Ultra", "Classic", "Modern", "Essential", "Advanced", "Signature", "Luxury", "Standard", "Compact", "Heavy-Duty", "Organic", "Smart"];

  const unsplashKeywords = {
    "Men's Clothing": ["mens-fashion", "tshirt", "jeans", "mens-clothing"],
    "Women's Clothing": ["womens-fashion", "dress", "handbag", "womens-clothing"],
    "Shoes": ["sneakers", "running-shoes", "boots", "footwear"],
    "Mobile Phones": ["smartphone", "iphone", "android", "mobile-phone"],
    "Laptops & Accessories": ["laptop", "keyboard", "mouse", "computer"],
    "Audio & Watches": ["headphones", "earbuds", "smartwatch", "watch"],
    "Gym Equipment": ["dumbbells", "kettlebell", "yoga-mat", "gym"],
    "Sports Outdoors": ["basketball", "tennis-racket", "camping-tent", "sports"],
    "Food & Groceries": ["fresh-vegetables", "fruits", "spices", "groceries"],
    "Beverages": ["coffee", "tea", "energy-drink", "beverage"],
    "Home Decor": ["vase", "cushion", "wall-art", "decor"],
    "Beauty & Personal Care": ["skincare", "makeup", "perfume", "beauty"],
    "Toys & Games": ["board-game", "action-figure", "lego", "toys"],
    "Books": ["novel", "textbook", "notebook", "books"],
    "Pet Supplies": ["dog-food", "cat-toy", "pet-bed", "pets"]
  };

  const generatedFiles = {
    hero: "hero_bg_1781934999722.png",
    electronics: "cat_electronics_1781935010765.png",
    fashion: "cat_fashion_1781935025497.png",
    gym: "cat_gym_1781935043053.png",
    food: "cat_food_1781935055746.png"
  };

  const products = [];
  let uidCounter = 1;

  categories.forEach(cat => {
    const catBrands = brands[cat];
    const catTypes = types[cat];
    const keywords = unsplashKeywords[cat];
    
    for (let i = 0; i < 50; i++) {
      const brand = catBrands[(i * 7 + 13) % catBrands.length];
      const type = catTypes[(i * 3 + 1) % catTypes.length];
      const adjective = adjectives[(i * 11 + 5) % adjectives.length];
      
      const name = `${brand} ${adjective} ${type}`;
      const keyword = keywords[i % keywords.length];
      
      let image = `https://picsum.photos/seed/${keyword}_${uidCounter}/400/400`;
      
      if (cat === "Laptops & Accessories" && i === 0) image = "/" + generatedFiles.electronics;
      if (cat === "Women's Clothing" && i === 0) image = "/" + generatedFiles.fashion;
      if (cat === "Gym Equipment" && i === 0) image = "/" + generatedFiles.gym;
      if (cat === "Food & Groceries" && i === 0) image = "/" + generatedFiles.food;

      let minPrice = 99;
      let maxPrice = 4900;
      if (cat === "Mobile Phones" || cat === "Laptops & Accessories") { minPrice = 5000; maxPrice = 95000; }
      else if (cat === "Audio & Watches") { minPrice = 999; maxPrice = 25000; }
      else if (cat === "Food & Groceries" || cat === "Beverages") { minPrice = 20; maxPrice = 900; }
      
      const price = Math.floor(((i * 149 + 311) % (maxPrice - minPrice))) + minPrice;
      const mrp = price + Math.floor(((i * 73 + 127) % (price * 0.4))) + 50;
      
      products.push({
        name: name,
        category: cat,
        price: price,
        mrp: mrp,
        description: `Premium high quality product from ${brand}. Features standard technical specifications and reliable durability.`,
        sellerName: `${brand} Official Store`,
        rating: Number((4.0 + ((i * 9) % 11) * 0.1).toFixed(1)),
        reviews: Math.floor(((i * 23 + 47) % 850)) + 15,
        image: image
      });
      uidCounter++;
    }
  });

  return products;
};

const seedInMemory = () => {
  const seedItems = generateAllSeedProducts();
  inMemoryProducts = seedItems.map((p, idx) => ({
    _id: `m_${idx + 1}`,
    ...p
  }));
  console.log(`In-memory database seeded with ${inMemoryProducts.length} initial products.`);
};

let inMemoryOrders = [];

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
  reviewList: [{
    user: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
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

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    qty: Number,
    image: String
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Processing', 'In Transit', 'Delivered'], default: 'Processing' },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ── Seeding Logic ──
const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const seedItems = generateAllSeedProducts();
      await Product.insertMany(seedItems);
      console.log(`Database seeded with ${seedItems.length} products.`);
    } else {
      console.log(`Database already has ${count} products — skipping seed.`);
    }
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
  const { category, seller, search } = req.query;
  try {
    if (isMongoConnected) {
      const filter = {};
      if (category) filter.category = category;
      if (seller) filter.sellerName = seller;
      if (search) filter.name = { $regex: search, $options: 'i' };
      const products = await Product.find(filter);
      res.json(products);
    } else {
      let products = inMemoryProducts;
      if (category) products = products.filter(p => p.category === category);
      if (seller) products = products.filter(p => p.sellerName === seller);
      if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      res.json(products);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST add a new product
app.post('/api/products', async (req, res) => {
  const { name, category, price, mrp, description, sellerName, image } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Required fields missing' });
  try {
    if (isMongoConnected) {
      const product = new Product({ name, category, price, mrp, description, sellerName, image });
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
        image: image || undefined,
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

// POST a review
app.post('/api/products/:id/reviews', async (req, res) => {
  const { user, rating, comment } = req.body;
  if (!user || !rating) return res.status(400).json({ error: 'Missing review details' });
  
  try {
    if (isMongoConnected) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      product.reviewList.push({ user, rating: Number(rating), comment });
      product.reviews = product.reviewList.length;
      product.rating = product.reviewList.reduce((acc, r) => acc + r.rating, 0) / product.reviews;
      
      await product.save();
      res.json(product);
    } else {
      const product = inMemoryProducts.find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      if (!product.reviewList) product.reviewList = [];
      product.reviewList.push({ user, rating: Number(rating), comment, date: new Date().toISOString() });
      product.reviews = product.reviewList.length;
      product.rating = product.reviewList.reduce((acc, r) => acc + r.rating, 0) / product.reviews;
      
      res.json(product);
    }
  } catch (err) { res.status(500).json({ error: 'Failed to add review' }); }
});

// GET product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } else {
      const product = inMemoryProducts.find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET unique sellers with product counts
app.get('/api/sellers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const sellers = await Product.aggregate([
        { $group: { _id: '$sellerName', productCount: { $sum: 1 } } },
        { $project: { name: '$_id', productCount: 1, _id: 0 } },
        { $sort: { productCount: -1 } }
      ]);
      res.json(sellers);
    } else {
      const sellerMap = {};
      inMemoryProducts.forEach(p => {
        sellerMap[p.sellerName] = (sellerMap[p.sellerName] || 0) + 1;
      });
      const sellers = Object.entries(sellerMap)
        .map(([name, productCount]) => ({ name, productCount }))
        .sort((a, b) => b.productCount - a.productCount);
      res.json(sellers);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// POST a new order
app.post('/api/orders', async (req, res) => {
  const { email, items, total, shippingAddress } = req.body;
  if (!email || !items || !total) return res.status(400).json({ error: 'Missing order details' });

  try {
    if (isMongoConnected) {
      const order = new Order({ email, items, total, shippingAddress });
      await order.save();
      res.status(201).json(order);
    } else {
      const order = {
        _id: `ord_${Date.now()}`,
        email, items, total, shippingAddress,
        status: 'Processing',
        createdAt: new Date().toISOString()
      };
      inMemoryOrders.unshift(order);
      res.status(201).json(order);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET orders by user email
app.get('/api/orders', async (req, res) => {
  const { email } = req.query;
  try {
    if (isMongoConnected) {
      const orders = await Order.find({ email }).sort({ createdAt: -1 });
      res.json(orders);
    } else {
      const orders = inMemoryOrders.filter(o => o.email === email);
      res.json(orders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET all orders (Admin)
app.get('/api/admin/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json(orders);
    } else {
      res.json(inMemoryOrders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// UPDATE order status (Admin)
app.put('/api/admin/orders/:id', async (req, res) => {
  const { status } = req.body;
  try {
    if (isMongoConnected) {
      const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
      res.json(order);
    } else {
      const order = inMemoryOrders.find(o => o._id === req.params.id);
      if (order) order.status = status;
      res.json(order);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// GET admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (isMongoConnected) {
      const productCount = await Product.countDocuments();
      const sellers = await Product.distinct('sellerName');
      
      const orders = await Order.find();
      const activeOrders = orders.filter(o => o.status !== 'Delivered').length;
      const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

      res.json({
        productCount,
        sellerCount: sellers.length,
        storeCount: Math.ceil(sellers.length * 1.5),
        totalRevenue: totalRevenue || 0,
        activeOrders
      });
    } else {
      const sellers = new Set(inMemoryProducts.map(p => p.sellerName));
      
      const activeOrders = inMemoryOrders.filter(o => o.status !== 'Delivered').length;
      const totalRevenue = inMemoryOrders.reduce((acc, o) => acc + o.total, 0);

      res.json({
        productCount: inMemoryProducts.length,
        sellerCount: sellers.size,
        storeCount: Math.ceil(sellers.size * 1.5),
        totalRevenue: totalRevenue || 0,
        activeOrders
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

