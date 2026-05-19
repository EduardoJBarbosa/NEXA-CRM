import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class SalesService {
  async getAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        skip,
        take: limit,
        include: { patient: true, procedure: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sale.count(),
    ])

    return { sales, total, page, limit }
  }

  async create(data: any) {
    return prisma.sale.create({
      data,
      include: { patient: true, procedure: true },
    })
  }

  async getById(id: string) {
    return prisma.sale.findUnique({
      where: { id },
      include: { patient: true, procedure: true },
    })
  }

  async getMonthlyRevenue(months = 12) {
    const sales = await prisma.sale.findMany({
      where: { status: 'PAID' },
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

  async getTotalRevenue() {
    const result = await prisma.sale.aggregate({
      where: { status: 'PAID' },
      _sum: { value: true },
    })
    return result._sum.value || 0
  }

  async getAverageTicket() {
    const result = await prisma.sale.aggregate({
      _avg: { value: true },
    })
    return result._avg.value || 0
  }
}
