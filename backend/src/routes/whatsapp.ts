import { Router } from 'express'
import { WhatsAppController } from '../controllers/whatsapp.js'

const router = Router()

router.post('/webhook', WhatsAppController.webhook)

export default router
