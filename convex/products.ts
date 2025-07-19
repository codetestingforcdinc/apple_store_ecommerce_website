import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Public queries
export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("products").withIndex("by_active", (q) => q.eq("isActive", true));
    
    if (args.category && typeof args.category === "string") {
      query = ctx.db.query("products").withIndex("by_category", (q) => q.eq("category", args.category!));
    }
    
    return await query.collect();
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  },
});

// Admin mutations
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    stock: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});

// Admin queries
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    return await ctx.db.query("products").collect();
  },
});
