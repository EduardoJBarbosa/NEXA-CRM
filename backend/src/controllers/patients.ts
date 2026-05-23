import { Response, Request } from 'express'
import { PatientsService } from '../services/patients.js'
import { createPatientSchema, updatePatientSchema } from '../schemas/index.js'

type AuthenticatedRequest = Request & {
  tenantId?: string
}

const service = new PatientsService()

export class PatientsController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const search = (req.query.search as string) || ''

      const result = await service.getAll(page, limit, search, req.tenantId)
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const patient = await service.getById(req.params.id, req.tenantId)
      if (!patient) return res.status(404).json({ error: 'Patient not found' })
      res.json(patient)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createPatientSchema.parse(req.body)
      if (!req.tenantId) {
        return res.status(400).json({ error: 'Tenant não identificado' })
      }
      const patient = await service.create(validated, req.tenantId)
      res.status(201).json(patient)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = updatePatientSchema.parse(req.body)
      const patient = await service.update(req.params.id, validated, req.tenantId)
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
