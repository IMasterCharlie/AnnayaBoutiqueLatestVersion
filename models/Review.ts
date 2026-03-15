import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  body: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
