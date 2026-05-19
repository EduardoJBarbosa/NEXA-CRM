import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PatientsService {
  async getAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit
    const where = search ? { name: { contains: search } } : {}

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.patient.count({ where }),
    ])

    return { patients, total, page, limit }
  }

  async getById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      include: { interactions: true, leads: true },
    })
  }

  async create(data: any) {
    return prisma.patient.create({ data })
  }

  async update(id: string, data: any) {
    return prisma.patient.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return prisma.patient.delete({ where: { id } })
  }

  async getUpcomingBirthdays(days = 30) {
    const patients = await prisma.patient.findMany()
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
