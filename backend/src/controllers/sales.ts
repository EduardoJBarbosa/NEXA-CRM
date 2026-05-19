import { Response, Request } from 'express'
import { SalesService } from '../services/sales.js'
import { createSaleSchema } from '../schemas/index.js'

const service = new SalesService()

export class SalesController {
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
      const sale = await service.getById(req.params.id)
      if (!sale) return res.status(404).json({ error: 'Sale not found' })
      res.json(sale)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validated = createSaleSchema.parse(req.body)
      const sale = await service.create(validated)
      res.status(201).json(sale)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}
