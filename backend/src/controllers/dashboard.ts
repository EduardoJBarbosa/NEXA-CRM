import { Response, Request } from 'express'
import { DashboardService } from '../services/dashboard.js'

const service = new DashboardService()

export class DashboardController {
  static async getMetrics(req: Request, res: Response) {
    try {
      const metrics = await service.getMetrics()
      res.json(metrics)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}

export class ReportsController {
  static async getFunnelAverageTime(req: Request, res: Response) {
    try {
      const averageTime = await service.getAverageFunnelTime()
      res.json({ averageTimeDays: averageTime })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}
