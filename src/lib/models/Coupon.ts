import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    maxDiscount: { type: Number, default: 0 }, // 0 means no limit
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
