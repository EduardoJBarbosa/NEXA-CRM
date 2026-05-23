import { useState, useEffect } from 'react'
import { AlertCircle, Loader, X } from 'lucide-react'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  daysRemaining?: number
}

export default function Billing() {
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/api/payment/subscription')
      setSubscription(response.data.subscription)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load subscription')
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true)
      await api.post('/api/payment/cancel')
      setShowConfirm(false)
      fetchSubscription()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800'
      case 'EXPIRED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      ACTIVE: 'Ativo',
      TRIALING: 'Em Período de Teste',
      EXPIRED: 'Expirado',
      CANCELLED: 'Cancelado',
    }
    return labels[status] || status
  }

  const getPlanLabel = (plan: string) => {
    const planMap: { [key: string]: { name: string; price: string } } = {
      plan_trial: { name: 'TRIAL', price: 'Gratuito' },
      TRIAL: { name: 'TRIAL', price: 'Gratuito' },
      plan_starter: { name: 'STARTER', price: 'R$ 99/mês' },
      STARTER: { name: 'STARTER', price: 'R$ 99/mês' },
      plan_pro: { name: 'PRO', price: 'R$ 299/mês' },
      PRO: { name: 'PRO', price: 'R$ 299/mês' },
    }
    return planMap[plan] || { name: plan, price: '-' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Erro ao carregar</h3>
            <p className="text-red-700">{error || 'Nenhuma assinatura encontrada'}</p>
          </div>
        </div>
      </div>
    )
  }

  const planInfo = getPlanLabel(subscription.plan)
  const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
          <p className="text-gray-600 mt-2">Gerencie sua assinatura e plano</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{planInfo.name}</h2>
              <p className="text-xl text-gray-600 mt-2">{planInfo.price}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
              {getStatusLabel(subscription.status)}
            </span>
          </div>

          {/* Plan Details */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Data de Início</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Data de Término</p>
                <p className="text-lg font-semibold text-gray-900">{endDate}</p>
              </div>

              {subscription.status === 'TRIALING' && subscription.daysRemaining !== undefined && (
                <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-600 font-semibold">
                    ⏰ {subscription.daysRemaining} dias restantes no período de teste
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t mt-6 pt-6 flex gap-4">
            <button
              onClick={() => navigate('/plans')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Alterar Plano
            </button>

            {subscription.status === 'ACTIVE' && (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancelar Assinatura
              </button>
            )}
          </div>
        </div>

        {/* Feature Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Sobre seu plano:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            {subscription.plan.includes('TRIAL') && (
              <>
                <li>✓ Até 100 pacientes</li>
                <li>✓ Até 5 usuários</li>
                <li>✓ Suporte básico</li>
              </>
            )}
            {subscription.plan.includes('STARTER') && (
              <>
                <li>✓ Até 500 pacientes</li>
                <li>✓ Até 15 usuários</li>
                <li>✓ Suporte por email</li>
              </>
            )}
            {subscription.plan.includes('PRO') && (
              <>
                <li>✓ Pacientes ilimitados</li>
                <li>✓ Usuários ilimitados</li>
                <li>✓ Suporte prioritário</li>
                <li>✓ Relatórios avançados</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancelar Assinatura</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos
              premium.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Não, continuar
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Sim, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
