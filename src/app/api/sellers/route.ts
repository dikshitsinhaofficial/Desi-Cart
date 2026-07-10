import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const sellers = await Product.aggregate([
      { $group: { _id: '$sellerName', productCount: { $sum: 1 } } },
      { $project: { name: '$_id', productCount: 1, _id: 0 } },
      { $sort: { productCount: -1 } }
    ]);
    return NextResponse.json(sellers);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}
