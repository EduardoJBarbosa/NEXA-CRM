export type UserRole = 'admin' | 'professional'

export interface AuthRequest {
  userId: string
  userRole: UserRole
}

export const LEAD_STATUSES = [
  'NOVO',
  'CONTATO_REALIZADO',
  'AVALIACAO_AGENDADA',
  'ORCAMENTO_ENVIADO',
  'NEGOCIACAO',
  'VENDA_REALIZADA',
  'PERDIDO',
] as const

export const INTERACTION_TYPES = ['FOLLOW_UP', 'CALL', 'EMAIL', 'NOTE', 'STATUS_CHANGE'] as const

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const

export const SALES_STATUSES = ['PENDING', 'PAID', 'CANCELLED'] as const
