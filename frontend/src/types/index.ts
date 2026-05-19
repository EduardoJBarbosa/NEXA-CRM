export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  cpf?: string
  leadSource: string
  tags: string
  createdAt: string
}

export interface Procedure {
  id: string
  name: string
  category: string
  estimatedPrice: number
}

export interface Lead {
  id: string
  patientId: string
  procedureId: string
  status: string
  estimatedValue: number
  notes: string
  assignedTo?: string
  leadSource: string
  patient: Patient
  procedure: Procedure
  professional?: any
  daysOld?: number
  isStale?: boolean
}

export interface Appointment {
  id: string
  patientId: string
  procedureId: string
  professionalId: string
  dateTime: string
  duration: number
  status: string
  room?: string
  patient: Patient
  procedure: Procedure
  professional: any
}

export interface Sale {
  id: string
  patientId: string
  procedureId: string
  value: number
  paymentMethod: string
  installments: number
  status: string
  paidAt?: string
  patient: Patient
  procedure: Procedure
}

export interface DashboardMetrics {
  totalLeadsMonth: number
  conversionRate: number
  realizadoRevenue: number
  expectedRevenue: number
  leadsByStage: Array<{ status: string; count: number }>
  leadsBySource: Array<{ source: string; count: number }>
}

export interface Interaction {
  id: string
  leadId: string
  patientId: string
  type: string
  description: string
  createdAt: string
}
