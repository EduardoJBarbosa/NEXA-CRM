import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, AlertCircle, Loader } from 'lucide-react'
import api from '@/services/api'
import { DashboardMetrics } from '@/types'
import { COLORS } from '@/utils/constants'

interface MetricCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/dashboard/metrics')
        setMetrics(response.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar métricas')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin mr-2" /> Carregando...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="text-red-600" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!metrics) return null

  const metricCards: MetricCard[] = [
    {
      title: 'Total de Leads (Mês)',
      value: metrics.totalLeadsMonth,
      icon: <Target size={24} />,
      color: 'bg-blue-50',
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: <TrendingUp size={24} />,
      color: 'bg-green-50',
    },
    {
      title: 'Faturamento Previsto',
      value: `R$ ${metrics.expectedRevenue.toLocaleString('pt-BR')}`,
      icon: <DollarSign size={24} />,
      color: 'bg-yellow-50',
    },
    {
      title: 'Faturamento Realizado',
      value: `R$ ${metrics.realizadoRevenue.toLocaleString('pt-BR')}`,
      icon: <Users size={24} />,
      color: 'bg-purple-50',
    },
  ]

  const chartColors = ['#1E88E5', '#26A69A', '#E53935', '#FB8C00', '#7E57C2', '#00ACC1']

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div key={idx} className={`${card.color} border border-gray-200 rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className="text-gray-400">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads por Etapa</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.leadsByStage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Origem dos Leads</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.leadsBySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, count }) => `${source}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.leadsBySource.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

