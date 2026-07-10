import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) return NextResponse.json([]);
  
  try {
    await dbConnect();
    const query = String(q).toLowerCase();
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(8);
    return NextResponse.json(products.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category
    })));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
