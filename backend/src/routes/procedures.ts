import { Router } from 'express'
import { ProceduresController } from '../controllers/procedures.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', ProceduresController.getAll)
router.post('/', ProceduresController.create)
router.get('/:id', ProceduresController.getById)
router.put('/:id', ProceduresController.update)
router.delete('/:id', ProceduresController.delete)

export default router
