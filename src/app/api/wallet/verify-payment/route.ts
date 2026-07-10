import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wallet from '@/lib/models/Wallet';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      await dbConnect();
      let wallet = await Wallet.findOne({ email: user.email });
      if (!wallet) wallet = new Wallet({ email: user.email, balance: 0 });
      wallet.balance += Number(amount);
      wallet.transactions.push({ amount, type: 'topup', status: 'success' });
      await wallet.save();
      return NextResponse.json({ success: true, balance: wallet.balance });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
