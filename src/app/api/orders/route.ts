import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    
    const orders = await Order.find({ email }).sort({ createdAt: -1 });
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

    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest('hex');
      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
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
