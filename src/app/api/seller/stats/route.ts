import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await dbConnect();
    const productCount = await Product.countDocuments({ sellerName: user.email });
    const orders = await Order.find({ 'items.sellerName': user.email });
    
    let activeOrders = 0;
    let totalSales = 0;
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.sellerName === user.email) {
          if (item.status !== 'Delivered') activeOrders++;
          if (item.status === 'Delivered') totalSales += (item.price * item.qty);
        }
      });
    });
    
    return NextResponse.json({ productCount, activeOrders, totalSales });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch seller stats' }, { status: 500 });
  }
}
