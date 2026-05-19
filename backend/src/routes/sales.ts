import { Router } from 'express'
import { SalesController } from '../controllers/sales.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', SalesController.getAll)
router.post('/', SalesController.create)
router.get('/:id', SalesController.getById)

export default router
