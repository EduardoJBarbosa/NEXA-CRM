import { Response, Request } from 'express'
import { LeadsService } from '../services/leads.js'
import { createLeadSchema, updateLeadSchema, moveLeadSchema } from '../schemas/index.js'

const service = new LeadsService()

export class LeadsController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 50
      const status = (req.query.status as string) || undefined
      const search = (req.query.search as string) || undefined
      const assignedTo = (req.query.assignedTo as string) || undefined

      const result = await service.getAll(page, limit, status, search, assignedTo)
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const lead = await service.getById(req.params.id)
      if (!lead) return res.status(404).json({ error: 'Lead not found' })
      res.json(lead)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validated = createLeadSchema.parse(req.body)
      const lead = await service.create(validated)
      res.status(201).json(lead)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const validated = updateLeadSchema.parse(req.body)
      const lead = await service.update(req.params.id, validated)
      res.json(lead)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async move(req: Request, res: Response) {
    try {
      const { status } = moveLeadSchema.parse(req.body)
      const lead = await service.moveLead(req.params.id, status)
      res.json(lead)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await service.delete(req.params.id)
      res.json({ message: 'Lead deleted' })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  static async getFollowups(req: Request, res: Response) {
    try {
      const leads = await service.getLeadsNeedingFollowup()
      res.json(leads)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}
