import { Response, Request } from 'express'
import { AppointmentsService } from '../services/appointments.js'
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/index.js'
import { UserRole } from '../types/index.js'

type AuthenticatedRequest = Request & {
  user?: {
    userId: string
    userRole: UserRole
  }
  tenantId?: string
}

const service = new AppointmentsService()

export class AppointmentsController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 50
      const tenantId = req.tenantId
      const userId = req.user?.userId
      const userRole = req.user?.userRole

      const result = await service.getAll(page, limit, tenantId, userId, userRole)
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const appointment = await service.getById(req.params.id, req.tenantId)
      if (!appointment) return res.status(404).json({ error: 'Appointment not found' })
      res.json(appointment)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createAppointmentSchema.parse(req.body)

      const userId = req.user?.userId
      const tenantId = req.tenantId

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant não identificado' })
      }

      console.log('=== DADOS RECEBIDOS DO FRONT ===')
      console.log(JSON.stringify(validated, null, 2))

      const appointment = await service.create(validated, userId, tenantId)
      res.status(201).json(appointment)
    } catch (error: any) {
      console.log('ERRO AO CRIAR AGENDAMENTO:', error)
      res.status(400).json({ error: error.message })
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const validated = updateAppointmentSchema.parse(req.body)
      const appointment = await service.update(id, validated, req.tenantId)
      res.json(appointment)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await service.delete(req.params.id)
      res.json({ message: 'Appointment deleted' })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}