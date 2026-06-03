import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@aasamedchem.com",
    },
    update: {},
    create: {
      name: "Admin",
      email: "admin@aasamedchem.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(admin);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });