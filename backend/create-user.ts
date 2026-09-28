import prisma from './src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) {
    console.log('❌ Nenhum tenant encontrado. Cria um tenant primeiro!')
    return
  }

  const hash = await bcrypt.hash('nexa123', 10)

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@nexa.com'
      }
    },
    update: { 
      password: hash 
    },
    create: {
      email: 'admin@nexa.com',
      name: 'Admin Nexa',
      password: hash,
      role: 'ADMIN',
      tenantId: tenant.id
    }
  })

  console.log('✅ Login: admin@nexa.com | Senha: nexa123 | Tenant:', tenant.id)
}

main().finally(() => prisma.$disconnect())