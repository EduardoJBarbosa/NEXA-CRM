import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AppointmentsService {
  async getAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        skip,
        take: limit,
        include: { patient: true, procedure: true, professional: true },
        orderBy: { dateTime: 'asc' },
      }),
      prisma.appointment.count(),
    ])

    return { appointments, total, page, limit }
  }

  async create(data: any) {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId: data.professionalId,
        dateTime: data.dateTime,
        status: { not: 'CANCELLED' },
      },
    })

    if (existingAppointment) {
      throw new Error('Horário indisponível para este profissional')
    }

    return prisma.appointment.create({
      data,
      include: { patient: true, procedure: true, professional: true },
    })
  }

  async update(id: string, data: any) {
    // Verifica se já existe outro agendamento no mesmo horário pro mesmo profissional
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: { not: id }, // Ignora o próprio agendamento
        professionalId: data.professionalId,
        dateTime: data.dateTime,
        status: { not: 'CANCELLED' },
      },
    })

    if (existingAppointment) {
      throw new Error('Horário indisponível para este profissional')
    }

    return prisma.appointment.update({
      where: { id },
      data,
      include: { patient: true, procedure: true, professional: true },
    })
  }

  async getByProfessionalAndDate(professionalId: string, dateStart: Date, dateEnd: Date) {
    return prisma.appointment.findMany({
      where: {
        professionalId,
        dateTime: { gte: dateStart, lte: dateEnd },
        status: { not: 'CANCELLED' },
      },
    })
  }

  async getById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, procedure: true, professional: true },
    })
  }

  async delete(id: string) {
    return prisma.appointment.delete({ where: { id } })
  }
}