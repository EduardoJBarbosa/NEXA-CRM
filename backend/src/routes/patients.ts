import { Router } from 'express'
import { PatientsController } from '../controllers/patients.js'
import { authMiddleware } from '../middleware/auth.js'
import { tenantMiddleware } from '../middleware/tenant.js'

const router = Router()

router.use(authMiddleware)
router.use(tenantMiddleware)

router.get('/', PatientsController.getAll)
router.post('/', PatientsController.create)
router.get('/:id', PatientsController.getById)
router.put('/:id', PatientsController.update)
router.delete('/:id', PatientsController.delete)

export default router
