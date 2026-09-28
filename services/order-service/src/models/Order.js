import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image_url: { type: String, default: "" },
  },
  { _id: true }
);

const shippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    items: [orderItemSchema],
    total_price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shipping: shippingSchema,
    payment_method: { type: String, default: "mock" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);