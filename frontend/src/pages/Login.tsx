import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { AlertCircle, Loader } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      setLoading(true)

      const response = await api.post('/api/auth/login', data)
      const { token, user } = response.data

      if (!token || !user) {
        setError('Resposta inválida do servidor')
        setLoading(false)
        return
      }

      setUser(user)
      setToken(token)

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexa-dark via-nexa-bg to-nexa-dark flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2 text-center">
            {APP_NAME}
          </h1>
          <p className="text-gray-300 text-center">Sistema Para Clínicas</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-gap gap-2">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Senha</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium py-3 rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
