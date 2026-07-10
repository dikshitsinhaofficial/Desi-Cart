import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wallet from '@/lib/models/Wallet';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      await dbConnect();
      let wallet = await Wallet.findOne();
      if (!wallet) wallet = new Wallet({ balance: 0 });
      wallet.transactions.push({ amount: Number(amount) || 0, type: 'purchase', status: 'success' });
      await wallet.save();
      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
