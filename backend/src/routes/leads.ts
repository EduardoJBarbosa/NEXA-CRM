import { Router } from 'express'
import { LeadsController } from '../controllers/leads.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', LeadsController.getAll)
router.get('/followups/pending', LeadsController.getFollowups)
router.post('/', LeadsController.create)
router.get('/:id', LeadsController.getById)
router.put('/:id', LeadsController.update)
router.post('/:id/move', LeadsController.move)
router.delete('/:id', LeadsController.delete)

export default router
