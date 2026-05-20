import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('nexa123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@nexa.com' },
    update: { password: hash },
    create: {
      email: 'admin@nexa.com',
      name: 'Admin Nexa',
      password: hash,
      role: 'ADMIN'
    }
  })

  console.log('✅ Login: admin@nexa.com | Senha: nexa123')
}

main().finally(() => prisma.$disconnect())
