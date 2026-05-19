import { useDraggable } from '@dnd-kit/core'
import { Lead } from '@/types'
import { Trash2 } from 'lucide-react'

interface LeadCardProps {
  lead: Lead
  onDelete: (id: string) => void
}

export function LeadCard({ lead, onDelete }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  })

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white border-2 rounded-lg p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
        lead.isStale ? 'border-red-400 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm text-gray-900 flex-1">{lead.patient?.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(lead.id)
          }}
          className="text-red-500 hover:bg-red-50 p-1 rounded"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-600 mb-2">{lead.procedure?.name}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-primary">R$ {lead.estimatedValue}</span>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {lead.daysOld} dias
        </span>
      </div>
      {lead.isStale && <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Parado há muito tempo</p>}
    </div>
  )
}
