import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding new local dev2.db...')

  // Create mock Organization
  const org = await prisma.organization.create({
    data: {
      name: 'GemInventory Corp',
    },
  })
  console.log(`Created organization: ${org.name} (${org.id})`)

  // Create default Admin User
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@gems.com',
      password: passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  })
  console.log(`Created admin user: ${admin.email} (pw: password123)`)

  // Create sample Product
  const product = await prisma.product.create({
    data: {
      name: 'Sample Rough Ruby',
      category: 'ROUGH',
      organizationId: org.id,
    },
  })

  const lot = await prisma.lot.create({
    data: {
      lotNumber: 'RUBY-001',
      productId: product.id,
      quantity: 50,
      organizationId: org.id,
    },
  })

  await prisma.purchase.create({
    data: {
      lotId: lot.id,
      supplier: 'Global Miners',
      purchasePrice: 150000,
      quantity: 50,
      organizationId: org.id,
    },
  })

  await prisma.stockLedger.create({
    data: {
      productId: product.id,
      transactionType: 'PURCHASE',
      quantity: 50,
      referenceId: 'MOCK_PURCHASE',
      organizationId: org.id,
    },
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
