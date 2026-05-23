import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PatientsService {
  async getAll(page = 1, limit = 10, search = '', tenantId?: string) {
    const skip = (page - 1) * limit
    const where: any = search
      ? {
          AND: [
            tenantId ? { tenantId } : {},
            {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          ],
        }
      : tenantId
      ? { tenantId }
      : {}

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.patient.count({ where }),
    ])

    return { patients, total, page, limit }
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId

    return prisma.patient.findUnique({
      where,
      include: { interactions: true, leads: true },
    })
  }

  async create(data: any, tenantId: string) {
    const patient = await prisma.patient.create({
      data: {
        tenantId,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        cpf: data.cpf || undefined,
        leadSource: data.leadSource || 'ORGANICO',
        tags: data.tags || undefined,
        status: 'NOVO',
      },
    })

    await prisma.lead.create({
      data: {
        tenantId,
        patientId: patient.id,
        leadSource: patient.leadSource,
        status: 'NOVO',
        estimatedValue: 0,
        notes: 'Lead criado automaticamente via cadastro de paciente',
      },
    })

    return patient
  }

  async update(id: string, data: any, tenantId?: string) {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        cpf: data.cpf || null,
        leadSource: data.leadSource,
        tags: data.tags || null,
      },
    })

    await prisma.lead.updateMany({
      where: { patientId: id, tenantId },
      data: {
        leadSource: patient.leadSource,
      },
    })

    return patient
  }

  async delete(id: string) {
    await prisma.lead.deleteMany({
      where: { patientId: id },
    })

    return prisma.patient.delete({ where: { id } })
  }

  async getUpcomingBirthdays(tenantId: string, days = 30) {
    const patients = await prisma.patient.findMany({
      where: { tenantId },
    })
    const today = new Date()
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

    return patients.filter((p) => {
      if (!p.birthDate) return false
      const bd = new Date(p.birthDate)
      const bdThisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate())
      return bdThisYear >= today && bdThisYear <= futureDate
    })
  }
}