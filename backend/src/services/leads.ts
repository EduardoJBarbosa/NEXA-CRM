import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class LeadsService {
  async getAll(page = 1, limit = 50, status?: string, search?: string, assignedTo?: string) {
    const skip = (page - 1) * limit
    const where: any = {}

    if (status) where.status = status
    if (assignedTo) where.assignedTo = assignedTo
    if (search) where.patient = { name: { contains: search } }

    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limit,
      include: { patient: true, procedure: true, professional: true },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.lead.count({ where })

    const leadsWithStale = leads.map((lead) => {
      const daysOld = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...lead,
        daysOld,
        isStale: lead.status === 'NOVO' && daysOld > 5,
      }
    })

    return { leads: leadsWithStale, total, page, limit }
  }

  async getById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: { patient: true, procedure: true, professional: true, interactions: true },
    })
  }

  async create(data: any) {
    return prisma.lead.create({
      data,
      include: { patient: true, procedure: true, professional: true },
    })
  }

  async update(id: string, data: any) {
    return prisma.lead.update({
      where: { id },
      data,
      include: { patient: true, procedure: true },
    })
  }

  async moveLead(id: string, newStatus: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { patient: true },
    })

    if (!lead) throw new Error('Lead not found')

    const updated = await prisma.lead.update({
      where: { id },
      data: { status: newStatus },
      include: { patient: true, procedure: true, professional: true },
    })

    if (newStatus === 'ORCAMENTO_ENVIADO') {
      await prisma.interaction.create({
        data: {
          leadId: id,
          patientId: lead.patientId,
          type: 'FOLLOW_UP',
          description: 'Follow-up em 2 dias - Orçamento enviado',
        },
      })
    }

    return updated
  }

  async delete(id: string) {
    return prisma.lead.delete({ where: { id } })
  }

  async getLeadsNeedingFollowup() {
    const leads = await prisma.lead.findMany({
      where: {
        status: { in: ['NOVO', 'CONTATO_REALIZADO', 'ORCAMENTO_ENVIADO'] },
      },
      include: { patient: true, procedure: true },
    })

    return leads
      .map((lead) => ({
        ...lead,
        daysOld: Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .filter((lead) => lead.daysOld >= 3)
      .sort((a, b) => b.daysOld - a.daysOld)
  }
}
