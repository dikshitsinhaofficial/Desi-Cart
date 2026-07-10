import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const productCount = await Product.countDocuments();
    const storeCount = 1; // single store platform for now
    
    const sellers = await Product.distinct('sellerName');
    const sellerCount = sellers.length;
    
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return NextResponse.json({ productCount, storeCount, sellerCount, totalRevenue });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
