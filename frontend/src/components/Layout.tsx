import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Menu, X, LogOut, BarChart3, Users, Calendar, DollarSign, Settings } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Users, label: 'Pacientes', path: '/patients' },
    { icon: Calendar, label: 'Agenda', path: '/appointments' },
    { icon: DollarSign, label: 'Financeiro', path: '/financial' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-nexa-bg">
      <aside
        className={`fixed md:relative inset-y-0 left-0 bg-nexa-dark border-r border-white/10 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <div className={`text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent ${!sidebarOpen && 'hidden md:block text-center'}`}>
              {sidebarOpen ? APP_NAME : 'N'}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-nexa-dark border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Logado como</p>
              <p className="font-medium text-white">{user?.name || 'Usuário'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
