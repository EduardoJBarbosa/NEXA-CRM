import { z } from 'zod'

export const createPatientSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  birthDate: z.string().datetime().optional(),
  cpf: z.string().optional(),
  leadSource: z.string().default('ORGANIC'),
  tags: z.string().optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export const createLeadSchema = z.object({
  patientId: z.string(),
  procedureId: z.string(),
  status: z.string().default('NOVO'),
  estimatedValue: z.number().positive(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  leadSource: z.string().default('ORGANIC'),
})

export const updateLeadSchema = createLeadSchema.partial()

export const moveLeadSchema = z.object({
  status: z.string(),
})

export const createAppointmentSchema = z.object({
  patientId: z.string(),
  procedureId: z.string(),
  professionalId: z.string(),
  dateTime: z.string().datetime(),
  duration: z.number().positive(),
  status: z.string().default('SCHEDULED'),
  room: z.string().optional(),
})

export const updateAppointmentSchema = createAppointmentSchema.partial()

export const createSaleSchema = z.object({
  patientId: z.string(),
  procedureId: z.string(),
  value: z.number().positive(),
  paymentMethod: z.string().default('CASH'),
  installments: z.number().positive().default(1),
  status: z.string().default('PENDING'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const createProcedureSchema = z.object({
  name: z.string().min(3),
  category: z.string().min(3),
  estimatedPrice: z.number().positive(),
})

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.string().default('professional'),
})

export const createSubscriptionSchema = z.object({
  planId: z.string(),
})

export const webhookSchema = z.object({
  event: z.string(),
  data: z.any(),
})
