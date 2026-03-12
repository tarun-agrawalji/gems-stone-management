import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { id: "default-org-id" },
    update: {},
    create: {
      id: "default-org-id",
      name: "Gems Corp",
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gems.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@gems.com",
      password: adminPassword,
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@gems.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@gems.com",
      password: staffPassword,
      role: "STAFF",
      organizationId: org.id,
    },
  });

  console.log("✅ Created users:");
  console.log(`   Admin: admin@gems.com / admin123`);
  console.log(`   Staff: staff@gems.com / staff123`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
