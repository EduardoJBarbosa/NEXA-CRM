import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AppointmentsService {
  async getAll(page = 1, limit = 50, tenantId?: string, userId?: string, userRole?: string) {
    const skip = (page - 1) * limit
    const whereClause: any = {}

    if (tenantId) whereClause.tenantId = tenantId

    if (userRole === 'professional' && userId) {
      whereClause.professionalId = userId
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          patient: true,
          procedure: true,
          professional: true,
        },
        orderBy: { dateTime: 'asc' },
      }),
      prisma.appointment.count({ where: whereClause }),
    ])

    return { appointments, total, page, limit }
  }

  async create(data: any, userId: string, tenantId: string) {
    const appointmentDateTime = new Date(data.dateTime)

    const [patient, professional, procedure, user] = await Promise.all([
      prisma.patient.findUnique({ where: { id: data.patientId } }),
      prisma.user.findUnique({ where: { id: data.professionalId } }),
      prisma.procedure.findUnique({ where: { id: data.procedureId } }),
      prisma.user.findUnique({ where: { id: userId } })
    ])

    if (!patient) throw new Error(`Paciente não encontrado: ${data.patientId}`)
    if (!professional) throw new Error(`Profissional não encontrado: ${data.professionalId}`)
    if (!procedure) throw new Error(`Procedimento não encontrado: ${data.procedureId}`)
    if (!user) throw new Error(`Usuário logado não encontrado: ${userId}`)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        tenantId,
        professionalId: data.professionalId,
        dateTime: appointmentDateTime,
        status: { not: 'CANCELLED' },
      },
    })

    if (existingAppointment) {
      throw new Error('Horário indisponível para este profissional')
    }

    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          tenantId,
          patientId: data.patientId,
          procedureId: data.procedureId,
          professionalId: data.professionalId,
          dateTime: appointmentDateTime,
          duration: data.duration,
          status: data.status || 'SCHEDULED',
          room: data.room || null,
        },
        include: {
          patient: true,
          procedure: true,
          professional: true,
        },
      })

      const status = appointment.status === 'SCHEDULED' ? 'AGENDADO' : appointment.status

      await tx.patient.update({
        where: { id: data.patientId },
        data: { status },
      })

      return appointment
    })
  }

  async update(id: string, data: any, tenantId?: string) {
    const current = await prisma.appointment.findUnique({ where: { id } })
    if (!current) throw new Error('Agendamento não encontrado')

    if (data.dateTime || data.professionalId) {
      const professionalId = data.professionalId || current.professionalId
      const dateTime = data.dateTime ? new Date(data.dateTime) : current.dateTime

      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          ...(tenantId ? { tenantId } : {}),
          id: { not: id },
          professionalId,
          dateTime,
          status: { not: 'CANCELLED' },
        },
      })

      if (existingAppointment) {
        throw new Error('Horário indisponível para este profissional')
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id },
        data: {
          ...data,
          dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
        },
        include: { patient: true, procedure: true, professional: true },
      })

      const patientStatus =
        updated.status === 'SCHEDULED'
          ? 'AGENDADO'
          : updated.status === 'COMPLETED'
          ? 'ATENDIDO'
          : updated.status === 'CANCELLED'
          ? 'CANCELADO'
          : updated.status

      await tx.patient.update({
        where: { id: updated.patientId },
        data: { status: patientStatus },
      })

      return updated
    })
  }

  async getByProfessionalAndDate(
    professionalId: string,
    dateStart: Date,
    dateEnd: Date,
    tenantId: string
  ) {
    return prisma.appointment.findMany({
      where: {
        tenantId,
        professionalId,
        dateTime: { gte: dateStart, lte: dateEnd },
        status: { not: 'CANCELLED' },
      },
    })
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId

    return prisma.appointment.findUnique({
      where,
      include: { patient: true, procedure: true, professional: true },
    })
  }

  async delete(id: string) {
    return prisma.appointment.delete({ where: { id } })
  }
}