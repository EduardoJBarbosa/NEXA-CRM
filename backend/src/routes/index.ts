import { Router } from 'express'
import authRoutes from './auth.js'
import patientsRoutes from './patients.js'
import leadsRoutes from './leads.js'
import appointmentsRoutes from './appointments.js'
import salesRoutes from './sales.js'
import dashboardRoutes from './dashboard.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/patients', patientsRoutes)
router.use('/leads', leadsRoutes)
router.use('/appointments', appointmentsRoutes)
router.use('/sales', salesRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
