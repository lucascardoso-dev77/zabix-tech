import { useEffect, useState, type FormEvent } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonRow } from '../../components/LoadingState'

type RhStatus = 'pendente' | 'aprovado' | 'reprovado' | 'concluido'
interface FeriasRow {
  id: string
  data_inicio: string
  data_fim: string
  dias: number
  status: RhStatus
}

const STATUS_LABEL: Record<RhStatus, string> = { pendente: 'Pendente', aprovado: 'Aprovado', reprovado: 'Reprovado', concluido: 'Concluído' }
const STATUS_CLASS: Record<RhStatus, string> = {
  pendente: 'bg-amber-50 text-amber-600',
  aprovado: 'bg-emerald-50 text-emerald-600',
  reprovado: 'bg-red-50 text-red-600',
  concluido: 'bg-brand-50 text-brand-600',
}

function diffDays(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

export default function Ferias() {
  const { user, profile } = useAuth()
  const { push } = useToast()
  const [items, setItems] = useState<FeriasRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    const query = supabase.from('ferias').select('*').order('data_inicio', { ascending: false })
    const { data } = profile?.role === 'admin' ? await query : await query.eq('user_id', user.id)
    setItems((data as FeriasRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile?.role])

  async function handleCreate(inicio: string, fim: string) {
    if (!user) return
    const dias = diffDays(inicio, fim)
    const { error } = await supabase.from('ferias').insert({ user_id: user.id, data_inicio: inicio, data_fim: fim, dias })
    if (error) {
      push('error', 'Não foi possível enviar a solicitação de férias.')
      return
    }
    push('success', 'Solicitação de férias enviada.')
    setModalOpen(false)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Férias</h1>
          <p className="mt-1 text-sm text-slate-500">Solicite e acompanhe seus períodos de férias.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Solicitar férias
        </button>
      </div>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2].map((i) => <SkeletonRow key={i} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nenhuma solicitação de férias ainda" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((f) => (
              <li key={f.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-navy-900">
                    {new Date(f.data_inicio).toLocaleDateString('pt-BR')} — {new Date(f.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-400">{f.dias} dia(s)</p>
                </div>
                <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[f.status]}`}>{STATUS_LABEL[f.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewFeriasModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </div>
  )
}

function NewFeriasModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (inicio: string, fim: string) => void }) {
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave(inicio, fim)
    setInicio('')
    setFim('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Solicitar férias">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Início</label>
            <input
              type="date"
              required
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Fim</label>
            <input
              type="date"
              required
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Enviar solicitação
        </button>
      </form>
    </Modal>
  )
}
