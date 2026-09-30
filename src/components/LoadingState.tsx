import { Loader2 } from 'lucide-react'

export function LoadingState({ label = 'Carregando...', fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div
      className={
        fullScreen
          ? 'flex h-screen w-full items-center justify-center bg-slate-50'
          : 'flex items-center justify-center py-12'
      }
    >
      <div className="flex items-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse space-y-2 px-6 py-4">
      <div className="h-3.5 w-3/5 rounded bg-slate-200" />
      <div className="h-3 w-2/5 rounded bg-slate-100" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 h-10 w-10 rounded-lg bg-slate-200" />
      <div className="mb-2 h-3.5 w-2/3 rounded bg-slate-200" />
      <div className="h-3 w-4/5 rounded bg-slate-100" />
    </div>
  )
}
