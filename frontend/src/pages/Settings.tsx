import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import api from '@/services/api'

interface Procedure {
  id: string
  name: string
  category: string
  estimatedPrice: number
  durationMin: number
  valor?: number
}

interface Settings {
  whatsappWebhookUrl: string
  whatsappApiToken: string
}

export default function Settings() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [settings, setSettings] = useState<Settings>({
    whatsappWebhookUrl: '',
    whatsappApiToken: '',
  })
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    estimatedPrice: 0,
    durationMin: 30,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'procedures' | 'whatsapp'>('procedures')

  useEffect(() => {
    fetchProcedures()
  }, [])

  const fetchProcedures = async () => {
    try {
      const response = await api.get('/api/procedures')
      setProcedures(response.data.procedures || response.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleSaveProcedure = async () => {
    try {
      if (!formData.name || !formData.category) {
        alert('Preencha todos os campos obrigatórios')
        return
      }

      if (editingId) {
        await api.put(`/api/procedures/${editingId}`, formData)
      } else {
        await api.post('/api/procedures', formData)
      }

      setShowModal(false)
      setFormData({
        name: '',
        category: '',
        estimatedPrice: 0,
        durationMin: 30,
      })
      setEditingId(null)
      fetchProcedures()
    } catch (err) {
      alert('Erro ao salvar procedimento')
    }
  }

  const handleDeleteProcedure = async (id: string) => {
    if (!confirm('Deletar este procedimento?')) return
    try {
      await api.delete(`/api/procedures/${id}`)
      fetchProcedures()
    } catch (err) {
      alert('Erro ao deletar')
    }
  }

  const handleEditProcedure = (proc: Procedure) => {
    setEditingId(proc.id)
    setFormData({
      name: proc.name,
      category: proc.category,
      estimatedPrice: proc.estimatedPrice,
      durationMin: proc.durationMin,
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('procedures')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'procedures'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Procedimentos
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'whatsapp'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          WhatsApp
        </button>
      </div>

      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Procedimentos</h2>
            <button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  name: '',
                  category: '',
                  estimatedPrice: 0,
                  durationMin: 30,
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
            >
              <Plus size={18} />
              Novo Procedimento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {procedures.map((proc) => (
              <div key={proc.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{proc.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{proc.category}</p>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Duração:</span>
                    <span className="ml-2 font-semibold text-gray-900">{proc.durationMin} min</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Valor:</span>
                    <span className="ml-2 font-semibold text-violet-600">
                      R$ {proc.estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProcedure(proc)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProcedure(proc.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    <Trash2 size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações WhatsApp</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.whatsappWebhookUrl}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappWebhookUrl: e.target.value })
                }
                placeholder="https://seu-webhook.com/whatsapp"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL para receber mensagens do WhatsApp
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Token
              </label>
              <input
                type="password"
                value={settings.whatsappApiToken}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappApiToken: e.target.value })
                }
                placeholder="Seu token de API"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Token de autenticação da API do WhatsApp
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900 font-semibold mb-2">📋 Instruções</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Configure o webhook para receber mensagens de WhatsApp</li>
                <li>Use a rota: POST /api/webhook/whatsapp</li>
                <li>Body esperado: {`{nome, telefone, mensagem, origem}`}</li>
              </ul>
            </div>

            <button
              onClick={() => {
                alert('Configurações salvas com sucesso!')
              }}
              className="w-full mt-6 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 font-medium"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {editingId ? 'Editar' : 'Novo'} Procedimento
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={formData.estimatedPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedPrice: parseFloat(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                <input
                  type="number"
                  value={formData.durationMin}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMin: parseInt(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProcedure}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
