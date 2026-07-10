import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wallet from '@/lib/models/Wallet';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    let wallet = await Wallet.findOne();
    if (!wallet) {
      wallet = new Wallet({ balance: 0 });
      await wallet.save();
    }
    return NextResponse.json(wallet);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
