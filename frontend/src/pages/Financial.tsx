import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import api from '@/services/api'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Sale {
  id: string
  patientId: string
  procedureId: string
  value: number
  paymentMethod: string
  installments: number
  status: string
  paidAt?: string
  createdAt: string
  patient?: { name: string }
  procedure?: { name: string }
}

interface ChartData {
  month: string
  value: number
}

export default function Financial() {
  const [sales, setSales] = useState<Sale[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [stats, setStats] = useState({
    monthTotal: 0,
    ticketAverage: 0,
    toReceive: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await api.get('/api/sales')
      const salesData = response.data.sales || response.data
      setSales(salesData)

      calculateStats(salesData)
      generateChartData(salesData)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const calculateStats = (salesData: Sale[]) => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const monthSales = salesData.filter((s) => {
      const saleDate = new Date(s.createdAt)
      return saleDate >= monthStart && saleDate <= monthEnd
    })

    const monthTotal = monthSales.reduce((sum, s) => sum + s.value, 0)
    const ticketAverage = monthSales.length > 0 ? monthTotal / monthSales.length : 0
    const toReceive = salesData
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + s.value, 0)

    setStats({
      monthTotal,
      ticketAverage,
      toReceive,
    })
  }

  const generateChartData = (salesData: Sale[]) => {
    const last6Months: ChartData[] = []

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)

      const monthSales = salesData.filter((s) => {
        const saleDate = new Date(s.createdAt)
        return saleDate >= monthStart && saleDate <= monthEnd && s.status === 'COMPLETED'
      })

      const value = monthSales.reduce((sum, s) => sum + s.value, 0)

      last6Months.push({
        month: format(date, 'MMM', { locale: ptBR }),
        value,
      })
    }

    setChartData(last6Months)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm">Total Mês</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.monthTotal)}</p>
            </div>
            <DollarSign size={40} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Ticket Médio</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.ticketAverage)}</p>
            </div>
            <TrendingUp size={40} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">A Receber</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.toReceive)}</p>
            </div>
            <Clock size={40} className="opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Faturamento - Últimos 6 Meses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="value" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Tendência Mensal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#7C3AED" name="Faturamento" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Vendas Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 font-semibold text-gray-700">Data</th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">Paciente</th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">Procedimento</th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">Valor</th>
                <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {format(new Date(sale.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {sale.patient?.name || 'Paciente'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {sale.procedure?.name || 'Procedimento'}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-violet-600">
                    {formatCurrency(sale.value)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        sale.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : sale.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sale.status === 'COMPLETED'
                        ? 'Pago'
                        : sale.status === 'PENDING'
                          ? 'Pendente'
                          : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
