const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking Lot model...");
  // In Prisma, we can check the dmmf or just try to access a field
  console.log(
    "Available models:",
    Object.keys(prisma).filter((k) => !k.startsWith("_") && !k.startsWith("$")),
  );

  // Try to access a new field (will throw if not generated)
  try {
    console.log("Checking lotNumber field in Lot...");
    const test = prisma.lot.fields.lotNumber;
    console.log("lotNumber field exists");
  } catch (e) {
    console.log("lotNumber field NOT found in current Prisma client");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
