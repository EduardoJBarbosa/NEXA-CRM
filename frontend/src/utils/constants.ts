export const APP_NAME = 'NEXA CRM'
export const APP_SHORT_NAME = 'NCR'

export const LEAD_STATUSES = [
  { value: 'NOVO', label: 'Novo' },
  { value: 'CONTATO_REALIZADO', label: 'Contato Realizado' },
  { value: 'AVALIACAO_AGENDADA', label: 'Avaliação Agendada' },
  { value: 'ORCAMENTO_ENVIADO', label: 'Orçamento Enviado' },
  { value: 'NEGOCIACAO', label: 'Negociação' },
  { value: 'VENDA_REALIZADA', label: 'Venda Realizada' },
  { value: 'PERDIDO', label: 'Perdido' },
]

export const LEAD_SOURCES = [
  { value: 'GOOGLE', label: 'Google' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'INDICACAO', label: 'Indicação' },
  { value: 'ORGANICO', label: 'Orgânico' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

export const COLORS = {
  primary: '#7C3AED',
  accent: '#06B6D4',
  dark: '#0A0A0F',
  darkSecondary: '#1A1A2E',
  success: '#26A69A',
  danger: '#E53935',
  warning: '#FB8C00',
  info: '#06B6D4',
}

export const APPOINTMENT_STATUSES = [
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export const SALES_STATUSES = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'COMPLETED', label: 'Pago' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CHECK', label: 'Cheque' },
]
