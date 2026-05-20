import { Router } from 'express'
import { AppointmentsController } from '../controllers/appointments.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', AppointmentsController.getAll)
router.post('/', AppointmentsController.create)
router.get('/:id', AppointmentsController.getById)
router.put('/:id', AppointmentsController.update) // ← ADICIONA ESSA LINHA
router.delete('/:id', AppointmentsController.delete)

export default router