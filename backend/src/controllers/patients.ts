import { Response, Request } from 'express'
import { PatientsService } from '../services/patients.js'
import { createPatientSchema, updatePatientSchema } from '../schemas/index.js'

const service = new PatientsService()

export class PatientsController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const search = (req.query.search as string) || ''

      const result = await service.getAll(page, limit, search)
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const patient = await service.getById(req.params.id)
      if (!patient) return res.status(404).json({ error: 'Patient not found' })
      res.json(patient)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validated = createPatientSchema.parse(req.body)
      const patient = await service.create(validated)
      res.status(201).json(patient)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const validated = updatePatientSchema.parse(req.body)
      const patient = await service.update(req.params.id, validated)
      res.json(patient)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await service.delete(req.params.id)
      res.json({ message: 'Patient deleted' })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}
