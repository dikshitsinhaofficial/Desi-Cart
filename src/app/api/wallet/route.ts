import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wallet from '@/lib/models/Wallet';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const email = user?.email || req.nextUrl.searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    let wallet = await Wallet.findOne({ email });
    if (!wallet) {
      wallet = new Wallet({ email, balance: 0 });
      await wallet.save();
    }
    return NextResponse.json(wallet);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
