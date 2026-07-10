import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch all orders' }, { status: 500 });
  }
}
