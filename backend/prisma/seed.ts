import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.procedure.deleteMany()

  const professionals = await prisma.user.createMany({
    data: [
      { name: 'Dr. João Silva', email: 'joao@clinic.com', role: 'dentist' },
      { name: 'Dra. Maria Oliveira', email: 'maria@clinic.com', role: 'aesthetician' },
      { name: 'Dra. Ana Costa', email: 'ana@clinic.com', role: 'dentist' },
    ],
  })

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@clinic.com', role: 'admin' },
  })

  const procedures = await prisma.procedure.createMany({
    data: [
      { name: 'Limpeza Dentária', category: 'Odontologia', estimatedPrice: 150 },
      { name: 'Clareamento Dental', category: 'Odontologia', estimatedPrice: 800 },
      { name: 'Implante Dentário', category: 'Odontologia', estimatedPrice: 3500 },
      { name: 'Aparelho Ortodôntico', category: 'Odontologia', estimatedPrice: 2500 },
      { name: 'Limpeza Facial', category: 'Estética', estimatedPrice: 200 },
      { name: 'Peeling', category: 'Estética', estimatedPrice: 400 },
      { name: 'Botox', category: 'Estética', estimatedPrice: 600 },
      { name: 'Preenchimento com Ácido Hialurônico', category: 'Estética', estimatedPrice: 800 },
    ],
  })

  const patients = await prisma.patient.createMany({
    data: [
      {
        name: 'Carlos Santos',
        phone: '11999999001',
        email: 'carlos@email.com',
        birthDate: new Date('1990-05-15'),
        cpf: '12345678901',
        leadSource: 'GOOGLE',
      },
      {
        name: 'Ana Paula',
        phone: '11999999002',
        email: 'ana@email.com',
        birthDate: new Date('1985-08-22'),
        cpf: '12345678902',
        leadSource: 'INSTAGRAM',
      },
      {
        name: 'Roberto Lima',
        phone: '11999999003',
        email: 'roberto@email.com',
        birthDate: new Date('1992-12-10'),
        cpf: '12345678903',
        leadSource: 'INDICACAO',
      },
      {
        name: 'Juliana Costa',
        phone: '11999999004',
        email: 'juliana@email.com',
        birthDate: new Date('1988-03-18'),
        cpf: '12345678904',
        leadSource: 'GOOGLE',
      },
      {
        name: 'Marco Antônio',
        phone: '11999999005',
        email: 'marco@email.com',
        birthDate: new Date('1995-07-30'),
        cpf: '12345678905',
        leadSource: 'ORGANICO',
      },
    ],
  })

  const professionalIds = (await prisma.user.findMany()).filter((u) => u.role !== 'admin').map((u) => u.id)
  const procedureIds = (await prisma.procedure.findMany()).map((p) => p.id)
  const patientIds = (await prisma.patient.findMany()).map((p) => p.id)

  await prisma.lead.createMany({
    data: [
      {
        patientId: patientIds[0],
        procedureId: procedureIds[0],
        status: 'NOVO',
        estimatedValue: 150,
        assignedTo: professionalIds[0],
        leadSource: 'GOOGLE',
        notes: 'Lead novo - aguardando contato',
      },
      {
        patientId: patientIds[1],
        procedureId: procedureIds[5],
        status: 'CONTATO_REALIZADO',
        estimatedValue: 400,
        assignedTo: professionalIds[1],
        leadSource: 'INSTAGRAM',
        notes: 'Cliente mostrou interesse',
      },
      {
        patientId: patientIds[2],
        procedureId: procedureIds[2],
        status: 'AVALIACAO_AGENDADA',
        estimatedValue: 3500,
        assignedTo: professionalIds[0],
        leadSource: 'INDICACAO',
        notes: 'Agendado para próxima terça',
      },
      {
        patientId: patientIds[3],
        procedureId: procedureIds[1],
        status: 'ORCAMENTO_ENVIADO',
        estimatedValue: 800,
        assignedTo: professionalIds[1],
        leadSource: 'GOOGLE',
        notes: 'Orçamento enviado',
      },
      {
        patientId: patientIds[4],
        procedureId: procedureIds[7],
        status: 'NEGOCIACAO',
        estimatedValue: 800,
        assignedTo: professionalIds[2],
        leadSource: 'ORGANICO',
        notes: 'Cliente negocia desconto',
      },
      {
        patientId: patientIds[0],
        procedureId: procedureIds[4],
        status: 'VENDA_REALIZADA',
        estimatedValue: 200,
        leadSource: 'GOOGLE',
        notes: 'Venda concluída',
      },
      {
        patientId: patientIds[1],
        procedureId: procedureIds[3],
        status: 'PERDIDO',
        estimatedValue: 2500,
        assignedTo: professionalIds[0],
        leadSource: 'INSTAGRAM',
        notes: 'Cliente optou por concorrente',
      },
      {
        patientId: patientIds[2],
        procedureId: procedureIds[6],
        status: 'NOVO',
        estimatedValue: 600,
        assignedTo: professionalIds[2],
        leadSource: 'INDICACAO',
        notes: 'Lead novo',
      },
      {
        patientId: patientIds[3],
        procedureId: procedureIds[0],
        status: 'CONTATO_REALIZADO',
        estimatedValue: 150,
        assignedTo: professionalIds[1],
        leadSource: 'GOOGLE',
        notes: 'Aguardando resposta do cliente',
      },
      {
        patientId: patientIds[4],
        procedureId: procedureIds[2],
        status: 'AVALIACAO_AGENDADA',
        estimatedValue: 3500,
        assignedTo: professionalIds[0],
        leadSource: 'ORGANICO',
        notes: 'Avaliação marcada',
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
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
