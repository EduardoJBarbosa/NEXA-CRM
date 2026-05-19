import { Router } from 'express'
import { DashboardController, ReportsController } from '../controllers/dashboard.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/metrics', DashboardController.getMetrics)
router.get('/reports/funil-tempo-medio', ReportsController.getFunnelAverageTime)

export default router
