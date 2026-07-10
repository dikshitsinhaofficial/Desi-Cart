import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Auth check — user must be authenticated to view their own orders
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // Always filter by the authenticated user's email — prevents IDOR
    const orders = await Order.find({ email: user.email }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, items, total, shippingAddress, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;
    if (!email || !items || !total) return NextResponse.json({ error: 'Missing order details' }, { status: 400 });

    // Payment verification is MANDATORY — no bypass allowed
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'Payment verification required' }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await dbConnect();

    const productIds = items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const enrichedItems = items.map((item: any) => {
      const prod = products.find(p => p._id.toString() === item.productId);
      return { ...item, sellerName: prod ? prod.sellerName : 'DesiCart', status: 'Processing' };
    });

    const order = new Order({
      email, items: enrichedItems, total, shippingAddress,
      razorpayOrderId, razorpayPaymentId, razorpaySignature
    });
    await order.save();
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
