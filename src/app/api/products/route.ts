import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const seller = searchParams.get('seller');
    const search = searchParams.get('search');
    
    const filter: any = {};
    if (category) filter.category = category;
    if (seller) filter.sellerName = seller;
    if (search) filter.name = { $regex: search, $options: 'i' };
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await dbConnect();
    const body = await req.json();
    const { name, category, price, mrp, description, image, sellerName } = body;
    
    if (!name || !price) {
      return NextResponse.json({ error: 'Missing product details' }, { status: 400 });
    }
    
    const product = new Product({
      name, category, price, mrp, description, image,
      sellerName: sellerName || user.email
    });
    await product.save();
    
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
