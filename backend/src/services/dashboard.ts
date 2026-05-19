import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DashboardService {
  async getMetrics() {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const leadsThisMonth = await prisma.lead.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
    })

    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    })

    const vendidosThisMonth = leadsByStatus.find((g) => g.status === 'VENDA_REALIZADA')?._count || 0
    const conversionRate = leadsThisMonth > 0 ? (vendidosThisMonth / leadsThisMonth) * 100 : 0

    const leadsBySource = await prisma.lead.groupBy({
      by: ['leadSource'],
      _count: true,
    })

    const salesThisMonth = await prisma.sale.aggregate({
      where: { createdAt: { gte: monthStart, lte: monthEnd }, status: 'PAID' },
      _sum: { value: true },
    })

    const expectedRevenue = await prisma.lead.aggregate({
      where: { status: 'ORCAMENTO_ENVIADO' },
      _sum: { estimatedValue: true },
    })

    return {
      totalLeadsMonth: leadsThisMonth,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      realizadoRevenue: salesThisMonth._sum.value || 0,
      expectedRevenue: expectedRevenue._sum.value || 0,
      leadsByStage: leadsByStatus.map((g) => ({
        status: g.status,
        count: g._count,
      })),
      leadsBySource: leadsBySource.map((g) => ({
        source: g.leadSource,
        count: g._count,
      })),
    }
  }

  async getAverageFunnelTime() {
    const vendidosLeads = await prisma.lead.findMany({
      where: { status: 'VENDA_REALIZADA' },
    })

    if (vendidosLeads.length === 0) return 0

    const times = vendidosLeads.map(
      (lead) => (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    )
    const average = times.reduce((a, b) => a + b, 0) / times.length

    return parseFloat(average.toFixed(2))
  }
}
