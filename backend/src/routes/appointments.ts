import { Router } from 'express'
import { AppointmentsController } from '../controllers/appointments'
import { authMiddleware } from '../middleware/auth'
import { tenantMiddleware } from '../middleware/tenant'

const router = Router()

router.use(authMiddleware)
router.use(tenantMiddleware)

router.get('/', AppointmentsController.getAll)
router.post('/', AppointmentsController.create)
router.get('/:id', AppointmentsController.getById)
router.put('/:id', AppointmentsController.update)
router.delete('/:id', AppointmentsController.delete)

export default router
