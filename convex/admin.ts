import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const checkAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { isAdmin: false };

    const user = await ctx.db.get(userId);
    if (!user) return { isAdmin: false };

    // Check if this is the special admin email
    if (user.email === "exploretutorialsofficial@gmail.com") {
      return { isAdmin: true, role: "super_admin" };
    }

    const adminUser = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    return {
      isAdmin: !!adminUser,
      role: adminUser?.role || null,
    };
  },
});

export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const currentAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!currentAdmin) throw new Error("Not authorized");

    const admins = await ctx.db.query("adminUsers").collect();
    
    const adminsWithUsers = await Promise.all(
      admins.map(async (admin) => {
        const user = await ctx.db.get(admin.userId);
        return {
          ...admin,
          user: user ? { email: user.email, name: user.name } : null,
        };
      })
    );

    return adminsWithUsers;
  },
});

export const addAdmin = mutation({
  args: {
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const currentAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!currentAdmin || currentAdmin.role !== "super_admin") throw new Error("Not authorized");

    // Find user by email
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email)).first();
    if (!user) throw new Error("User not found");

    // Check if already admin
    const existingAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", user._id)).first();
    if (existingAdmin) throw new Error("User is already an admin");

    await ctx.db.insert("adminUsers", {
      userId: user._id,
      email: args.email,
      role: args.role,
      addedBy: userId,
    });
  },
});

export const removeAdmin = mutation({
  args: { adminId: v.id("adminUsers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const currentAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!currentAdmin || currentAdmin.role !== "super_admin") throw new Error("Not authorized");

    const adminToRemove = await ctx.db.get(args.adminId);
    if (!adminToRemove) throw new Error("Admin not found");

    // Don't allow removing the super admin
    if (adminToRemove.email === "exploretutorialsofficial@gmail.com") {
      throw new Error("Cannot remove super admin");
    }

    await ctx.db.delete(args.adminId);
  },
});

export const setupSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.email !== "exploretutorialsofficial@gmail.com") {
      throw new Error("Not authorized");
    }

    // Check if already exists
    const existingAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (existingAdmin) return;

    await ctx.db.insert("adminUsers", {
      userId,
      email: user.email,
      role: "super_admin",
    });
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const isAdmin = await ctx.db.query("adminUsers").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!isAdmin) throw new Error("Not authorized");

    const [products, orders, users, admins] = await Promise.all([
      ctx.db.query("products").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("adminUsers").collect(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === "pending").length;

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalAdmins: admins.length,
      totalRevenue,
      pendingOrders,
    };
  },
});
