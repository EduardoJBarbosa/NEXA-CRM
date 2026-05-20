import { Response, Request } from 'express'
import { AppointmentsService } from '../services/appointments.js'
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/index.js'

const service = new AppointmentsService()

export class AppointmentsController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 50

      const result = await service.getAll(page, limit)
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const appointment = await service.getById(req.params.id)
      if (!appointment) return res.status(404).json({ error: 'Appointment not found' })
      res.json(appointment)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validated = createAppointmentSchema.parse(req.body)
      const appointment = await service.create(validated)
      res.status(201).json(appointment)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const validated = updateAppointmentSchema.parse(req.body)
      const appointment = await service.update(id, validated)
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
