import mongoose from 'mongoose';

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

export default mongoose.models.Product || mongoose.model('Product', productSchema);
