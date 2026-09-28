import prisma from '../lib/prisma'

export class SalesService {
  async getAll(page = 1, limit = 50, tenantId?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (tenantId) where.tenantId = tenantId

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        include: { patient: true, procedure: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sale.count({ where }),
    ])

    return { sales, total, page, limit }
  }

  async create(data: any) {
    return prisma.sale.create({
      data,
      include: { patient: true, procedure: true },
    })
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId

    return prisma.sale.findUnique({
      where,
      include: { patient: true, procedure: true },
    })
  }

  async getMonthlyRevenue(months = 12, tenantId?: string) {
    const where: any = { status: 'PAID' }
    if (tenantId) where.tenantId = tenantId

    const sales = await prisma.sale.findMany({
      where,
      include: { procedure: true },
    })

    const today = new Date()
    const monthsAgo = new Date(today.getFullYear(), today.getMonth() - months, 1)

    const filtered = sales.filter((s) => s.createdAt >= monthsAgo)

    const grouped: any = {}
    filtered.forEach((sale) => {
      const key = sale.createdAt.toISOString().slice(0, 7)
      grouped[key] = (grouped[key] || 0) + sale.value
    })

    return grouped
  }

  async getTotalRevenue(tenantId?: string) {
    const where: any = { status: 'PAID' }
    if (tenantId) where.tenantId = tenantId

    const result = await prisma.sale.aggregate({
      where,
      _sum: { value: true },
    })
    return result._sum.value || 0
  }

  async getAverageTicket(tenantId?: string) {
    const where: any = {}
    if (tenantId) where.tenantId = tenantId

    const result = await prisma.sale.aggregate({
      where,
      _avg: { value: true },
    })
    return result._avg.value || 0
  }

  async getFinancialSummary(tenantId: string) {
    const now = new Date()
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [salesThisMonth, aReceberAgg, paidAgg, ticketAgg] = await Promise.all([
      prisma.sale.findMany({
        where: { tenantId, createdAt: { gte: startMonth } }
      }),
      prisma.sale.aggregate({
        where: { tenantId, status: 'PENDING' },
        _sum: { value: true }
      }),
      prisma.sale.aggregate({
        where: { tenantId, status: 'PAID', createdAt: { gte: startMonth } },
        _sum: { value: true }
      }),
      prisma.sale.aggregate({
        where: { tenantId, createdAt: { gte: startMonth } },
        _avg: { value: true }
      })
    ])

    return {
      totalMes: paidAgg._sum.value || salesThisMonth.reduce((acc, s) => acc + s.value, 0),
      ticketMedio: ticketAgg._avg.value || 0,
      aReceber: aReceberAgg._sum.value || 0,
      countMes: salesThisMonth.length
    }
  }
}