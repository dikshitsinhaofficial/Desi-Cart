import { NextResponse, NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const { success } = rateLimit(ip, { windowMs: 60000, max: 10 }); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { amount } = await req.json();
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_checkout_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create checkout payment order' }, { status: 500 });
  }
}
