import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Limpando banco...')
  await prisma.interaction.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.procedure.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  console.log('Criando planos...')
  const proPlan = await prisma.plan.create({
    data: {
      name: 'PRO',
      price: 9700,
      interval: 'MONTH',
      features: JSON.stringify(['pacientes_ilimitados', 'agenda', 'relatorios']),
      active: true,
    },
  })

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'ENTERPRISE',
      price: 29700,
      interval: 'MONTH',
      features: JSON.stringify([
        'pacientes_ilimitados',
        'agenda',
        'relatorios',
        'api_access',
        'suporte_prioritario',
      ]),
      active: true,
    },
  })

  console.log(`✅ Planos criados: PRO (R$ 97,00) e ENTERPRISE (R$ 297,00)`)

  const hashedPassword = await bcrypt.hash('123456', 10)
  console.log('Senha padrão: 123456')

  const now = new Date()
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Clínica Demo',
      slug: 'clinic-demo',
      plan: 'TRIAL',
      subscription: {
        create: {
          status: 'TRIALING',
          plan: 'TRIAL',
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          trialEnd: trialEnd,
        },
      },
    },
  })

  console.log(`✅ Tenant criado: ${tenant.name} (${tenant.slug})`)
  console.log(`   Trial expira em: ${trialEnd.toLocaleDateString('pt-BR')}`)

  const users = await prisma.user.createMany({
    data: [
      { tenantId: tenant.id, name: 'Dr. João Silva', email: 'joao@clinic.com', password: hashedPassword, role: 'professional' },
      { tenantId: tenant.id, name: 'Dra. Maria Oliveira', email: 'maria@clinic.com', password: hashedPassword, role: 'professional' },
      { tenantId: tenant.id, name: 'Dra. Ana Costa', email: 'ana@clinic.com', password: hashedPassword, role: 'professional' },
      { tenantId: tenant.id, name: 'Admin', email: 'admin@clinic.com', password: hashedPassword, role: 'admin' },
    ],
  })

  console.log(`✅ ${users.count} usuários criados`)

  const procedures = await prisma.procedure.createMany({
    data: [
      { tenantId: tenant.id, name: 'Limpeza Dentária', category: 'Odontologia', estimatedPrice: 150 },
      { tenantId: tenant.id, name: 'Clareamento Dental', category: 'Odontologia', estimatedPrice: 800 },
      { tenantId: tenant.id, name: 'Implante Dentário', category: 'Odontologia', estimatedPrice: 3500 },
      { tenantId: tenant.id, name: 'Aparelho Ortodôntico', category: 'Odontologia', estimatedPrice: 2500 },
      { tenantId: tenant.id, name: 'Limpeza Facial', category: 'Estética', estimatedPrice: 200 },
      { tenantId: tenant.id, name: 'Peeling', category: 'Estética', estimatedPrice: 400 },
      { tenantId: tenant.id, name: 'Botox', category: 'Estética', estimatedPrice: 600 },
      { tenantId: tenant.id, name: 'Preenchimento com Ácido Hialurônico', category: 'Estética', estimatedPrice: 800 },
    ],
  })

  console.log(`✅ ${procedures.count} procedimentos criados`)

  console.log('\n✅ Seed completed successfully!')
  console.log('Login: admin@clinic.com | Senha: 123456')
  console.log(`Tenant Slug: ${tenant.slug}`)
  console.log('\n📋 Planos disponíveis:')
  console.log(`  - PRO: R$ 97,00/mês`)
  console.log(`  - ENTERPRISE: R$ 297,00/mês`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
