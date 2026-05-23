import { Router } from 'express'
import { TenantsController } from '../controllers/tenants.js'
import { tenantMiddleware } from '../middleware/tenant.js'

const router = Router()

router.post('/register', TenantsController.register)
router.get('/', tenantMiddleware, TenantsController.getBySlug)

export default router
