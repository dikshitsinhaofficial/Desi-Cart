import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  transactions: [{
    amount: Number,
    type: { type: String, enum: ['topup', 'purchase'] },
    status: String,
    date: { type: Date, default: Date.now }
  }]
});

export default mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
