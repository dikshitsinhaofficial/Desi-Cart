const fs = require('fs');
const path = require('path');

const categories = [
  "Men's Clothing", "Women's Clothing", "Shoes", "Mobile Phones", 
  "Laptops & Accessories", "Audio & Watches", "Gym Equipment", 
  "Sports Outdoors", "Food & Groceries", "Beverages", 
  "Home Decor", "Beauty & Personal Care", "Toys & Games", 
  "Books", "Pet Supplies"
];

const unsplashKeywords = {
  "Men's Clothing": ["mens-fashion", "tshirt", "jeans"],
  "Women's Clothing": ["womens-fashion", "dress", "handbag"],
  "Shoes": ["sneakers", "running-shoes", "boots"],
  "Mobile Phones": ["smartphone", "iphone", "android"],
  "Laptops & Accessories": ["laptop", "keyboard", "mouse"],
  "Audio & Watches": ["headphones", "earbuds", "smartwatch"],
  "Gym Equipment": ["dumbbells", "kettlebell", "yoga-mat"],
  "Sports Outdoors": ["basketball", "tennis-racket", "camping-tent"],
  "Food & Groceries": ["fresh-vegetables", "fruits", "spices"],
  "Beverages": ["coffee", "tea", "energy-drink"],
  "Home Decor": ["vase", "cushion", "wall-art"],
  "Beauty & Personal Care": ["skincare", "makeup", "perfume"],
  "Toys & Games": ["board-game", "action-figure", "lego"],
  "Books": ["novel", "textbook", "notebook"],
  "Pet Supplies": ["dog-food", "cat-toy", "pet-bed"]
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
  const keywords = unsplashKeywords[cat];
  for (let i = 0; i < 4; i++) {
    const keyword = keywords[i % keywords.length];
    // Specific custom images for the first item of certain categories
    let image = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80`; // fallback
    // Since Unsplash source API is deprecated, we will use fixed Unsplash IDs or Placeholders. 
    // To make it easy and reliable, we'll use a reliable placeholder service with keywords:
    image = `https://picsum.photos/seed/${keyword}${i}/400/400`;
    
    if (cat === "Laptops & Accessories" && i === 0) image = "/" + generatedFiles.electronics;
    if (cat === "Women's Clothing" && i === 0) image = "/" + generatedFiles.fashion;
    if (cat === "Gym Equipment" && i === 0) image = "/" + generatedFiles.gym;
    if (cat === "Food & Groceries" && i === 0) image = "/" + generatedFiles.food;

    const price = Math.floor(Math.random() * 4900) + 99; // 99 to 4999
    const mrp = price + Math.floor(Math.random() * 2000) + 100;
    
    products.push({
      uid: `prod_${uidCounter++}`,
      name: `Premium ${keyword.replace('-', ' ')} ${i + 1}`,
      category: cat,
      price: price,
      mrp: mrp,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
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
console.log('Successfully generated 60 products in products.ts');
