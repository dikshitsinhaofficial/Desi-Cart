import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Coupon from '@/lib/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();
    if (!code || !cartTotal) {
      return NextResponse.json({ error: 'Code and cart total are required.' }, { status: 400 });
    }

    await dbConnect();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'This coupon is no longer active.' }, { status: 400 });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    let discountAmount = (cartTotal * coupon.discountPercentage) / 100;
    if (coupon.maxDiscount && coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    return NextResponse.json({
      success: true,
      discountAmount: Math.round(discountAmount),
      code: coupon.code,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply coupon.' }, { status: 500 });
  }
}
