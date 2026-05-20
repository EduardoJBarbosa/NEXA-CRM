import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface RouteGuardProps {
  children: ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, token, user, initializeFromStorage } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initializeFromStorage()
    setIsReady(true)
  }, [])

  if (!isReady) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
