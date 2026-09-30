import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'
interface ToastItem { id: number; type: ToastType; message: string }

const ToastContext = createContext<{ push: (type: ToastType, message: string) => void } | undefined>(undefined)

const styles: Record<ToastType, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  error: { icon: XCircle, classes: 'border-red-200 bg-red-50 text-red-700' },
  warning: { icon: AlertTriangle, classes: 'border-amber-200 bg-amber-50 text-amber-700' },
  info: { icon: Info, classes: 'border-brand-200 bg-brand-50 text-brand-700' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, classes } = styles[t.type]
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${classes}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.message}</span>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="ml-2 opacity-60 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
