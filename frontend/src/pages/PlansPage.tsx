import { useState, useEffect } from 'react'
import { Loader, Check, AlertCircle } from 'lucide-react'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'

interface Plan {
  id: string
  name: string
  price: number
  interval: string
  features: string
}

export default function PlansPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/payment/plans')
      setPlans(response.data.plans || [])
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load plans')
      setLoading(false)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/api/payment/subscription')
      setCurrentPlan(response.data.subscription.plan)
    } catch (err) {
      // Subscription might not exist yet
      setCurrentPlan(null)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(planId)
      setError('')
      await api.post('/api/payment/subscribe', { planId })

      // Redirect to billing page
      setTimeout(() => {
        navigate('/billing')
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to subscribe to plan')
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Escolha seu plano</h1>
          <p className="text-xl text-gray-600">Comece com teste gratuito de 14 dias</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.includes(plan.name) || currentPlan === plan.id
            const planFeatures = plan.features.split(', ').filter(f => f.trim())

            return (
              <div
                key={plan.id}
                className={`rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 ${
                  isCurrentPlan ? 'ring-2 ring-blue-600 bg-white' : 'bg-white'
                }`}
              >
                {/* Plan Badge */}
                {isCurrentPlan && (
                  <div className="bg-blue-600 text-white py-1 text-center text-sm font-semibold">
                    Seu plano atual
                  </div>
                )}

                {/* Plan Content */}
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/mês</span>
                    )}
                  </div>

                  {plan.price === 0 && (
                    <p className="text-gray-600 mb-6 text-sm">14 dias de teste gratuito</p>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {planFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || subscribing === plan.id}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-gray-200 text-gray-600 cursor-default'
                        : subscribing === plan.id
                          ? 'bg-blue-400 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plano Atual'
                    ) : (
                      'Escolher Plano'
                    )}
                  </button>
                </div>

                {/* Footer Note */}
                <div className="bg-gray-50 px-8 py-4 text-center">
                  <p className="text-xs text-gray-600">
                    Sem compromisso. Cancele a qualquer momento.
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Perguntas Frequentes</h3>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold text-gray-900 mb-2">Posso mudar de plano depois?</h4>
              <p className="text-gray-700">
                Sim! Você pode fazer upgrade ou downgrade de plano a qualquer momento. A mudança
                entrará em vigor no próximo ciclo de faturamento.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold text-gray-900 mb-2">E se cancelar minha assinatura?</h4>
              <p className="text-gray-700">
                Se cancelar, você terá acesso até o final do ciclo de faturamento atual. Nenhuma
                cobrança adicional será feita.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold text-gray-900 mb-2">Qual é a política de reembolso?</h4>
              <p className="text-gray-700">
                Oferecemos uma garantia de 30 dias de dinheiro de volta se você não estiver
                satisfeito. Entre em contato com nosso suporte.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 mb-4">
            Precisa de ajuda na escolha?{' '}
            <a href="mailto:suporte@nexa.com.br" className="text-blue-600 font-semibold hover:underline">
              Entre em contato conosco
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
