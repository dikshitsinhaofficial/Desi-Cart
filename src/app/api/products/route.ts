import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

// Escape user input to prevent ReDoS attacks
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const seller = searchParams.get('seller');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(48, parseInt(searchParams.get('limit') || '24'));

    const filter: any = {};
    if (category) filter.category = category;
    if (seller) filter.sellerName = seller;
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).select('-reviewList').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
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
