import { Router, Request, Response } from 'express'
import { PaymentController } from '../controllers/payment.js'
import { authMiddleware } from '../middleware/auth.js'
import { tenantMiddleware } from '../middleware/tenant.js'

const router = Router()

// Public routes
router.get('/plans', PaymentController.listPlans)
router.post('/webhook', (req: Request, res: Response) => PaymentController.webhook(req, res))

// Protected routes
router.get('/subscription', authMiddleware, tenantMiddleware, (req: Request, res: Response) =>
  PaymentController.getCurrentSubscription(req, res),
)

router.post('/subscribe', authMiddleware, tenantMiddleware, (req: Request, res: Response) =>
  PaymentController.createSubscription(req, res),
)

router.post('/cancel', authMiddleware, tenantMiddleware, (req: Request, res: Response) =>
  PaymentController.cancelSubscription(req, res),
)

export default router
