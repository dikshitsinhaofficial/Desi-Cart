import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { user, rating, comment } = await req.json();
    if (!user || !rating) return NextResponse.json({ error: 'Missing review details' }, { status: 400 });
    
    await dbConnect();
    const params = await props.params;
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    
    product.reviewList.push({ user, rating: Number(rating), comment });
    product.reviews = product.reviewList.length;
    product.rating = product.reviewList.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews;
    
    await product.save();
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
