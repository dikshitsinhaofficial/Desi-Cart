import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    qty: Number,
    image: String,
    sellerName: String,
    status: { type: String, enum: ['Processing', 'In Transit', 'Delivered'], default: 'Processing' }
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
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
