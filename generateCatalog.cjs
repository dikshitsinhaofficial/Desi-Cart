const fs = require('fs');
const path = require('path');

const categories = [
  "Men's Clothing", "Women's Clothing", "Shoes", "Mobile Phones", 
  "Laptops & Accessories", "Audio & Watches", "Gym Equipment", 
  "Sports Outdoors", "Food & Groceries", "Beverages", 
  "Home Decor", "Beauty & Personal Care", "Toys & Games", 
  "Books", "Pet Supplies"
];

// Seed data for random product generation
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

// We will map the specific generated files from the public folder
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
    const brand = catBrands[Math.floor(Math.random() * catBrands.length)];
    const type = catTypes[Math.floor(Math.random() * catTypes.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const name = `${brand} ${adjective} ${type}`;
    const keyword = keywords[i % keywords.length];
    
    // Use placehold.co or picsum. Picsum is good for random realistic photos.
    // We add the uid to the seed to ensure consistent but unique images.
    let image = `https://picsum.photos/seed/${keyword}_${uidCounter}/400/400`;
    
    // Assign custom AI generated images to the very first item of specific categories
    if (cat === "Laptops & Accessories" && i === 0) image = "/" + generatedFiles.electronics;
    if (cat === "Women's Clothing" && i === 0) image = "/" + generatedFiles.fashion;
    if (cat === "Gym Equipment" && i === 0) image = "/" + generatedFiles.gym;
    if (cat === "Food & Groceries" && i === 0) image = "/" + generatedFiles.food;

    // Price scaling based on category
    let minPrice = 99;
    let maxPrice = 4900;
    if (cat === "Mobile Phones" || cat === "Laptops & Accessories") { minPrice = 5000; maxPrice = 95000; }
    else if (cat === "Audio & Watches") { minPrice = 999; maxPrice = 25000; }
    else if (cat === "Food & Groceries" || cat === "Beverages") { minPrice = 20; maxPrice = 900; }
    
    const price = Math.floor(Math.random() * (maxPrice - minPrice)) + minPrice;
    const mrp = price + Math.floor(Math.random() * (price * 0.5)) + 100; // MRP is 10-50% higher
    
    products.push({
      _id: `prod_${uidCounter++}`,
      name: name,
      category: cat,
      price: price,
      mrp: mrp,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0
      reviews: Math.floor(Math.random() * 900) + 10,
      image: image
    });
  }
});

const fileContent = `export const CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const STATIC_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

const targetDir = path.join(__dirname, 'frontend', 'src', 'app', 'data');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(path.join(targetDir, 'products.ts'), fileContent);
console.log('Successfully generated 750 realistic products in products.ts');
