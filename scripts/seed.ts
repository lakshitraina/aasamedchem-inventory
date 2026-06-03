import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  // 1. Seed Admin
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@aasamedchem.com",
    },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@aasamedchem.com",
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin seeded:", admin.email);

  // 2. Seed Regular User
  const hashedUserPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: {
      email: "user@aasamedchem.com",
    },
    update: {},
    create: {
      name: "Standard Seller",
      email: "user@aasamedchem.com",
      password: hashedUserPassword,
      role: "USER",
    },
  });
  console.log("User seeded:", user.email);

  // 3. Seed Products
  console.log("Seeding products...");

  const products = [
    {
      name: "Industrial Rice Starch",
      sku: "STARCH-RIC-01",
      dimension: "WEIGHT" as const,
      baseUnit: "g",
      stockQuantity: 500000, // 500 kg
      basePrice: 0.08, // ₹0.08 per gram (i.e. ₹80 per kg)
      category: "Excipients",
      description: "High-grade rice starch powder used as binder excipient in solid dosage tablet formulations.",
    },
    {
      name: "Absolute Ethanol 99.9%",
      sku: "SOLV-ETH-99",
      dimension: "VOLUME" as const,
      baseUnit: "mL",
      stockQuantity: 250000, // 250 Liters
      basePrice: 0.45, // ₹0.45 per mL (i.e. ₹450 per Liter)
      category: "Solvents",
      description: "Reagent grade absolute ethanol solvent for extraction and purification procedures.",
    },
    {
      name: "Gelatin Capsules Size 0",
      sku: "CAPS-GEL-SZ0",
      dimension: "COUNT" as const,
      baseUnit: "items",
      stockQuantity: 10000, // 10,000 capsules
      basePrice: 1.20, // ₹1.20 per capsule
      category: "Capsules",
      description: "Hard gelatin empty capsules, clear size 0, suitable for powder filling.",
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        stockQuantity: p.stockQuantity,
        basePrice: p.basePrice,
        category: p.category,
        description: p.description,
      },
      create: p,
    });
    console.log(`Product seeded/updated: ${product.name} (${product.sku})`);
  }

  console.log("Database seeding completed!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });