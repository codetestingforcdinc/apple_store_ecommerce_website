import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    totalAmount: v.number(),
    shippingAddress: v.object({
      fullName: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      phone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const orderId = await ctx.db.insert("orders", {
      userId,
      items: args.items,
      totalAmount: args.totalAmount,
      status: "pending",
      shippingAddress: args.shippingAddress,
      paymentMethod: "Cash on Delivery",
      orderDate: Date.now(),
    });

    // Clear cart after order
    const cartItems = await ctx.db.query("cartItems").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return orderId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db.query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.id);
    if (!order || order.userId !== userId) throw new Error("Order not found");

    return order;
  },
});

// Admin queries and mutations
export const listAll = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    let orders;
    
    if (args.status && typeof args.status === "string") {
      orders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").collect();
    } else {
      orders = await ctx.db.query("orders").order("desc").collect();
    }


    
    // Get user details for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          user: user ? { email: user.email, name: user.name } : null,
        };
      })
    );

    return ordersWithUsers;
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    await ctx.db.patch(args.orderId, { status: args.status });
  },
});
