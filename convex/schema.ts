import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    stock: v.number(),
    isActive: v.boolean(),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    totalAmount: v.number(),
    status: v.string(), // "pending", "confirmed", "shipped", "delivered", "cancelled"
    shippingAddress: v.object({
      fullName: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      phone: v.string(),
    }),
    paymentMethod: v.string(),
    orderDate: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_date", ["orderDate"]),

  adminUsers: defineTable({
    userId: v.id("users"),
    email: v.string(),
    role: v.string(), // "admin", "super_admin"
    addedBy: v.optional(v.id("users")),
  }).index("by_user", ["userId"])
    .index("by_email", ["email"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
