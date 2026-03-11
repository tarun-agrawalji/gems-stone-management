const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Attempting to create a test Lot with itemName...");
  try {
    const lot = await prisma.lot.create({
      data: {
        lotNumber: "TEST-" + Date.now(),
        productId: "cmmk13cvp0004w5psjhmuxrte", // Use a known valid ID from previous logs
        itemName: "Test Item",
        grossWeight: 10,
        netWeight: 7,
        quantity: 1,
        organizationId: "cmmk0f8l60000w5ps39ehpl02", // Use a known valid ID
        status: "IN_STOCK",
      },
    });
    console.log("Success! Lot created:", lot.id);
  } catch (error) {
    console.error("FAILED to create lot:");
    console.error(error.message);
    if (error.message.includes("Unknown argument")) {
      console.log(
        "\nDIAGNOSIS: The Prisma Client is STILL OUT OF SYNC with the schema.",
      );
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
