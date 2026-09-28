import prisma from '../lib/prisma'

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
    const current = await prisma.lead.findUnique({ where: { id } })
    if (!current) throw new Error('Lead not found')

    const updated = await prisma.lead.update({
      where: { id },
      data,
      include: { patient: true, procedure: true },
    })

    // Se atualizar direto pra completo, também cria financeiro
    await this.createSaleIfCompleted(current.status, updated)

    return updated
  }

  async moveLead(id: string, newStatus: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { patient: true, procedure: true },
    })

    if (!lead) throw new Error('Lead not found')

    const updated = await prisma.lead.update({
      where: { id },
      data: { status: newStatus },
      include: { patient: true, procedure: true, professional: true },
    })

    if (newStatus === 'ORCAMENTO_ENVIADO' && lead.patientId) {
      await prisma.interaction.create({
        data: {
          tenantId: lead.tenantId,
          leadId: id,
          patientId: lead.patientId,
          type: 'FOLLOW_UP',
          description: 'Follow-up em 2 dias - Orçamento enviado',
        },
      })
    }

    // 💰 CRIA FINANCEIRO QUANDO FECHA
    await this.createSaleIfCompleted(lead.status, updated)

    return updated
  }

  private async createSaleIfCompleted(oldStatus: string, lead: any) {
    const statusCompleto = ['PROCEDIMENTO_COMPLETO', 'GANHO', 'FECHADO', 'CONVERTIDO', 'COMPLETED']
    
    if (!statusCompleto.includes(lead.status)) return
    if (statusCompleto.includes(oldStatus)) return // já era completo, não duplica
    if (!lead.patientId || !lead.procedureId) return

    const valorFinal = lead.procedure?.valor || lead.procedure?.estimatedPrice || lead.estimatedValue || 0
    if (valorFinal <= 0) return

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const existingSale = await prisma.sale.findFirst({
      where: {
        tenantId: lead.tenantId,
        patientId: lead.patientId,
        procedureId: lead.procedureId,
        createdAt: { gte: startOfDay }
      }
    })

    if (existingSale) return

    await prisma.sale.create({
      data: {
        tenantId: lead.tenantId,
        patientId: lead.patientId,
        procedureId: lead.procedureId,
        value: valorFinal,
        status: 'PENDING',
        paymentMethod: 'CASH',
        installments: 1
      }
    })

    console.log(`💰 Sale criado via Lead: R$ ${valorFinal} - ${lead.patient?.name || lead.patientId}`)
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