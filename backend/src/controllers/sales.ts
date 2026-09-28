import { Response, Request } from 'express'
import { SalesService } from '../services/sales.js'
import { createSaleSchema } from '../schemas/index.js'

const service = new SalesService()

export class SalesController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 50
      // PEGA O TENANT DO USUÁRIO LOGADO
      const tenantId = (req as any).user?.tenantId || (req as any).tenantId

      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant não identificado' })
      }

      const result = await service.getAll(page, limit, tenantId)
      res.json(result)
    } catch (error: any) {
      console.error('Erro getAll sales:', error)
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId
      const sale = await service.getById(req.params.id, tenantId)
      if (!sale) return res.status(404).json({ error: 'Sale not found' })
      res.json(sale)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId
      const validated = createSaleSchema.parse(req.body)
      const sale = await service.create({ ...validated, tenantId })
      res.status(201).json(sale)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}
