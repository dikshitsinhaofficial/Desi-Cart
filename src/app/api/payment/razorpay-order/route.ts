import { NextResponse, NextRequest } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });
    
    const { amount } = await req.json();
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
