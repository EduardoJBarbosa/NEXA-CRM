import { Router } from 'express'
import authRoutes from './auth.js'
import patientsRoutes from './patients.js'
import leadsRoutes from './leads.js'
import appointmentsRoutes from './appointments.js'
import salesRoutes from './sales.js'
import dashboardRoutes from './dashboard.js'
import whatsappRoutes from './whatsapp.js'
import proceduresRoutes from './procedures.js'
import tenantsRoutes from './tenants.js'
import paymentRoutes from './payment.js'

const router = Router()

router.use('/tenants', tenantsRoutes)
router.use('/auth', authRoutes)
router.use('/patients', patientsRoutes)
router.use('/leads', leadsRoutes)
router.use('/appointments', appointmentsRoutes)
router.use('/sales', salesRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/webhook', whatsappRoutes)
router.use('/procedures', proceduresRoutes)
router.use('/payment', paymentRoutes)

export default router
