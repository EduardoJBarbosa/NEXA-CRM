import { useState, useEffect } from 'react'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
// 👇 TROCA ESSA LINHA PRO TEU HOOK DE AUTH
import { useAuthStore } from '../stores/authStore'

interface Appointment {
  id: string
  patientId: string
  procedureId: string
  professionalId: string
  dateTime: string
  duration: number
  status: string
  room?: string
  patient?: { name: string }
  procedure?: { name: string }
  professional?: { name: string }
}

export default function Appointments() {
  const { user } = useAuthStore() // ← PEGA O ADMIN LOGADO AQUI
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])
  const [formData, setFormData] = useState({
    patientId: '',
    procedureId: '',
    professionalId: '',
    dateTime: '',
    duration: 30,
    status: 'SCHEDULED',
    room: '',
  })

  // Seta o professionalId quando o user carregar
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({...prev, professionalId: user.id }))
    }
  }, [user])

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchProcedures()
  }, [currentDate])

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments')
      setAppointments(response.data.appointments || response.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients')
      setPatients(response.data.patients || response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProcedures = async () => {
    try {
      const response = await api.get('/api/procedures')
      setProcedures(response.data.procedures || response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.patientId ||!formData.procedureId ||!formData.dateTime) {
        alert('Preencha todos os campos obrigatórios')
        return
      }

      if (!formData.professionalId) {
        alert('Erro: Usuário não está logado. Faça login novamente.')
        return
      }

      const payload = {
     ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
      }

      if (editingId) {
        await api.put(`/api/appointments/${editingId}`, payload)
      } else {
        await api.post('/api/appointments', payload)
      }

      setShowModal(false)
      setFormData({
        patientId: '',
        procedureId: '',
        professionalId: user?.id || '',
        dateTime: '',
        duration: 30,
        status: 'SCHEDULED',
        room: '',
      })
      setEditingId(null)
      fetchAppointments()
    } catch (err: any) {
      console.error(err)
      alert('Erro ao salvar agendamento: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este agendamento?')) return
    try {
      await api.delete(`/api/appointments/${id}`)
      fetchAppointments()
    } catch (err) {
      alert('Erro ao deletar')
    }
  }

  const handleEdit = (apt: Appointment) => {
    setEditingId(apt.id)
    setFormData({
      patientId: apt.patientId,
      procedureId: apt.procedureId,
      professionalId: apt.professionalId,
      dateTime: apt.dateTime.slice(0, 16),
      duration: apt.duration,
      status: apt.status,
      room: apt.room || '',
    })
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200'
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200 line-through'
      default: return 'bg-violet-100 text-violet-700 border-violet-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendado'
      case 'CONFIRMED': return 'Confirmado'
      case 'COMPLETED': return 'Completado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth()
  const monthAppts = appointments.filter((apt) => {
    const aptDate = new Date(apt.dateTime)
    return (
      aptDate.getMonth() === currentDate.getMonth() &&
      aptDate.getFullYear() === currentDate.getFullYear()
    )
  })

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              patientId: '',
              procedureId: '',
              professionalId: user?.id || '', // ← AGORA CERTO
              dateTime: '',
              duration: 30,
              status: 'SCHEDULED',
              room: '',
            })
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          <Plus size={18} />
          Novo Agendamento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
            <div key={day} className="text-center font-bold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div
              key={idx}
              className="aspect-square p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              {day && (
                <>
                  <div className="font-bold text-gray-900 mb-1">{day}</div>
                  <div className="text-xs space-y-1">
                    {monthAppts
                  .filter((apt) => new Date(apt.dateTime).getDate() === day)
                  .slice(0, 2)
                  .map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-1 rounded text-xs truncate border ${getStatusColor(apt.status)}`}
                          title={`${apt.patient?.name} - ${getStatusLabel(apt.status)}`}
                        >
                          {apt.patient?.name?.split(' ')[0] || 'Paciente'}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Próximos Agendamentos</h2>
        <div className="space-y-2">
          {monthAppts.slice(0, 5).map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {format(new Date(apt.dateTime), 'dd/MM/yyyy HH:mm', { locale: ptBR })} • {apt.procedure?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(apt)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(apt.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {editingId? 'Editar' : 'Novo'} Agendamento
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Paciente</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Procedimento</label>
                <select
                  value={formData.procedureId}
                  onChange={(e) => setFormData({...formData, procedureId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Selecione um procedimento</option>
                  {procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="SCHEDULED">Agendado</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sala</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value })}
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
                  onClick={handleSave}
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