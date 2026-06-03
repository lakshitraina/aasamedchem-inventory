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
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });