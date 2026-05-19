import { Router } from 'express'
import { PatientsController } from '../controllers/patients.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', PatientsController.getAll)
router.post('/', PatientsController.create)
router.get('/:id', PatientsController.getById)
router.put('/:id', PatientsController.update)
router.delete('/:id', PatientsController.delete)

export default router
