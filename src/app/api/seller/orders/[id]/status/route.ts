import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await dbConnect();
    const params = await props.params;
    const { status } = await req.json();
    
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    let updated = false;
    order.items.forEach((item: any) => {
      if (item.sellerName === user.email) {
        item.status = status;
        updated = true;
      }
    });
    
    if (updated) await order.save();
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
