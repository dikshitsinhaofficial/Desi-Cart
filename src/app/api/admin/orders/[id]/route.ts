import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const { status } = await req.json();
    await dbConnect();
    const params = await props.params;
    
    const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
