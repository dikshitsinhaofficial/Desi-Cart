import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await props.params;
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await dbConnect();
    const params = await props.params;
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
