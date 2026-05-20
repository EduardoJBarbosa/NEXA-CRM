import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Lead } from '@/types'
import { KanbanColumn } from '@/components/leads/KanbanColumn'
import { LEAD_STATUSES } from '@/utils/constants'
import api from '@/services/api'
import { Loader, AlertCircle, MessageCircle } from 'lucide-react'

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/leads?limit=100')
      setLeads(response.data.leads)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const leadId = active.id as string
    const newStatus = over.id as string

    try {
      await api.post(`/api/leads/${leadId}/move`, { status: newStatus })
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)),
      )
    } catch (err: any) {
      setError('Erro ao mover lead')
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este lead?')) return

    try {
      await api.delete(`/api/leads/${id}`)
      setLeads((prev) => prev.filter((lead) => lead.id !== id))
    } catch (err: any) {
      setError('Erro ao deletar lead')
    }
  }

  const handleWhatsApp = (phone: string) => {
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}`
    window.open(whatsappUrl, '_blank')
  }

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Funil de Vendas</h1>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 auto-cols-fr">
          {LEAD_STATUSES.map(({ value, label }) => (
            <KanbanColumn
              key={value}
              status={value}
              title={label}
              leads={leads.filter((lead) => lead.status === value)}
              onDeleteLead={handleDeleteLead}
              onWhatsApp={handleWhatsApp}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
