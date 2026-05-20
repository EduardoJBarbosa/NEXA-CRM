import { useDroppable } from '@dnd-kit/core'
import { Lead } from '@/types'
import { LeadCard } from './LeadCard'

interface KanbanColumnProps {
  status: string
  title: string
  leads: Lead[]
  onDeleteLead: (id: string) => void
  onWhatsApp?: (phone: string) => void
}

export function KanbanColumn({ status, title, leads, onDeleteLead, onWhatsApp }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
          {leads.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {leads.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Nenhum lead</p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} onDelete={onDeleteLead} onWhatsApp={onWhatsApp} />)
        )}
      </div>
    </div>
  )
}
