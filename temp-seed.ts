import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding minimal admin...')

  let org = await prisma.organization.findFirst()
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Default Organization' }
    })
  }

  const pw = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@gems.com' },
    update: { password: pw, role: 'ADMIN', organizationId: org.id },
    create: {
      email: 'admin@gems.com',
      name: 'Admin',
      password: pw,
      role: 'ADMIN',
      organizationId: org.id
    }
  })

  console.log('Done seeding admin@gems.com / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
