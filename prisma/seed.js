const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gems.com" },
    update: { password: adminPassword },
    create: {
      name: "Admin",
      email: "admin@gems.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const staffPassword = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@gems.com" },
    update: { password: staffPassword },
    create: {
      name: "Staff User",
      email: "staff@gems.com",
      password: staffPassword,
      role: "STAFF",
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
