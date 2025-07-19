import { mutation } from "./_generated/server";

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return "Products already seeded";
    }

    const products = [
      {
        name: "iPhone 15 Pro",
        description: "The most advanced iPhone yet with titanium design, A17 Pro chip, and pro camera system.",
        price: 999,
        category: "iPhone",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692895703814",
        stock: 50,
        isActive: true,
      },
      {
        name: "iPhone 15",
        description: "The new iPhone 15 with Dynamic Island, 48MP camera, and USB-C.",
        price: 799,
        category: "iPhone",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692895703814",
        stock: 75,
        isActive: true,
      },
      {
        name: "MacBook Pro 14-inch",
        description: "Supercharged by M3 Pro or M3 Max chip for demanding workflows.",
        price: 1999,
        category: "Mac",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290",
        stock: 25,
        isActive: true,
      },
      {
        name: "MacBook Air 13-inch",
        description: "Incredibly thin and light laptop with M2 chip and all-day battery life.",
        price: 1099,
        category: "Mac",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034",
        stock: 40,
        isActive: true,
      },
      {
        name: "iPad Pro 12.9-inch",
        description: "The ultimate iPad experience with M2 chip and Liquid Retina XDR display.",
        price: 1099,
        category: "iPad",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202210?wid=940&hei=1112&fmt=p-jpg&qlt=95&.v=1664411207213",
        stock: 30,
        isActive: true,
      },
      {
        name: "iPad Air",
        description: "Serious performance in a thin and light design with M1 chip.",
        price: 599,
        category: "iPad",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-wifi-blue-202203?wid=940&hei=1112&fmt=p-jpg&qlt=95&.v=1645065732688",
        stock: 45,
        isActive: true,
      },
      {
        name: "Apple Watch Series 9",
        description: "The most advanced Apple Watch with S9 chip and Double Tap gesture.",
        price: 399,
        category: "Apple Watch",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-45mm-pink-sport-band-pink-pdp-image-position-1__en-us?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1692895795617",
        stock: 60,
        isActive: true,
      },
      {
        name: "AirPods Pro (2nd generation)",
        description: "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio.",
        price: 249,
        category: "AirPods",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361",
        stock: 100,
        isActive: true,
      },
      {
        name: "AirPods (3rd generation)",
        description: "Spatial Audio, sweat and water resistant, up to 30 hours of battery life.",
        price: 179,
        category: "AirPods",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1632861342669",
        stock: 80,
        isActive: true,
      },
      {
        name: "Mac Studio",
        description: "Outrageous performance with M2 Max or M2 Ultra chip in a compact design.",
        price: 1999,
        category: "Mac",
        imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-studio-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1684345161143",
        stock: 15,
        isActive: true,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "Products seeded successfully";
  },
});
