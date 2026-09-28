import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image_url: { type: String, default: "" },
  },
  { timestamps: true }
);

cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model("CartItem", cartItemSchema);