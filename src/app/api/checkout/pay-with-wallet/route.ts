import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wallet from '@/lib/models/Wallet';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }
    
    await dbConnect();
    let wallet = await Wallet.findOne();
    if (!wallet) {
      wallet = new Wallet({ balance: 0 });
      await wallet.save();
    }

    if (wallet.balance < Number(amount)) {
      return NextResponse.json({ success: false, message: 'Insufficient wallet balance' }, { status: 400 });
    }

    wallet.balance -= Number(amount);
    wallet.transactions.push({
      amount: Number(amount),
      type: 'purchase',
      status: 'success',
      date: new Date()
    });
    await wallet.save();
    return NextResponse.json({ success: true, balance: wallet.balance, message: 'Payment successful using wallet!' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to process wallet payment' }, { status: 500 });
  }
}
