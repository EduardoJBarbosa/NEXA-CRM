import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  setToken: (token: string) => void
  setUser: (user: User) => void
  setAuthLoading: (loading: boolean) => void
  logout: () => void
  initializeFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  setAuthLoading: (loading) => set({ loading }),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  initializeFromStorage: () => {
    try {
      const token = localStorage.getItem('token')
      const userJson = localStorage.getItem('user')
      const user = userJson ? JSON.parse(userJson) : null

      if (token && user) {
        set({ token, user, isAuthenticated: true })
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ token: null, user: null, isAuthenticated: false })
    }
  },
}))
