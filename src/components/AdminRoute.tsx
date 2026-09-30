import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ShieldAlert } from 'lucide-react'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()

  if (loading) return <LoadingState label="Verificando permissões..." />

  if (profile?.role !== 'admin') {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Acesso restrito"
        description="Esta área é exclusiva para administradores."
      />
    )
  }

  return <>{children}</>
}
