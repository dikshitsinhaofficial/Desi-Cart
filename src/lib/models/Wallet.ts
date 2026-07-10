import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    amount: Number,
    type: { type: String, enum: ['topup', 'purchase'] },
    status: String,
    date: { type: Date, default: Date.now }
  }]
});

export default mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
