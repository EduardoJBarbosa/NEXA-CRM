import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Kanban,
  Home,
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/leads', label: 'Leads', icon: Kanban },
    { path: '/patients', label: 'Pacientes', icon: Users },
    { path: '/appointments', label: 'Agenda', icon: Calendar },
    { path: '/financial', label: 'Financeiro', icon: DollarSign },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className={`font-bold text-primary ${sidebarOpen ? 'text-xl' : 'text-xs text-center'}`}>
            {sidebarOpen ? 'CRM Clínica' : 'CRM'}
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-600 font-medium">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
