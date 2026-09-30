import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from './LoadingState'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <LoadingState fullScreen label="Carregando seu portal..." />
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
