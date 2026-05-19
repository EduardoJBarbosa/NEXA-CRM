import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Patient } from '@/types'
import api from '@/services/api'
import { Loader, AlertCircle, Edit2, Trash2, Plus } from 'lucide-react'
import { LEAD_SOURCES } from '@/utils/constants'

const patientSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
  leadSource: z.string(),
  tags: z.string().optional(),
})

type PatientForm = z.infer<typeof patientSchema>

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: { leadSource: 'ORGANIC' },
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/patients?limit=50')
      setPatients(response.data.patients)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PatientForm) => {
    try {
      if (editingId) {
        await api.put(`/api/patients/${editingId}`, data)
        setPatients((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...data } : p)),
        )
      } else {
        const response = await api.post('/api/patients', data)
        setPatients((prev) => [response.data, ...prev])
      }

      setShowModal(false)
      setEditingId(null)
      reset()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar paciente')
    }
  }

  const handleEdit = (patient: Patient) => {
    reset(patient as PatientForm)
    setEditingId(patient.id)
    setShowModal(true)
  }

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Tem certeza?')) return

    try {
      await api.delete(`/api/patients/${id}`)
      setPatients((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      setError('Erro ao deletar paciente')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin mr-2" /> Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <button
          onClick={() => {
            reset()
            setEditingId(null)
            setShowModal(true)
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Paciente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Telefone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Origem</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.email || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{patient.leadSource}</td>
                <td className="px-6 py-4 text-right text-sm flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(patient)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input {...register('name')} className="w-full px-3 py-2 border rounded-lg" />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone *</label>
                <input {...register('phone')} className="w-full px-3 py-2 border rounded-lg" />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Origem</label>
                <select
                  {...register('leadSource')}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
