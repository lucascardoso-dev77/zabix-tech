import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonRow } from '../../components/LoadingState'

type RhStatus = 'pendente' | 'aprovado' | 'reprovado' | 'concluido'
interface Solicitacao {
  id: string
  tipo: string
  descricao: string
  status: RhStatus
  created_at: string
}

const STATUS_LABEL: Record<RhStatus, string> = { pendente: 'Pendente', aprovado: 'Aprovado', reprovado: 'Reprovado', concluido: 'Concluído' }
const STATUS_CLASS: Record<RhStatus, string> = {
  pendente: 'bg-amber-50 text-amber-600',
  aprovado: 'bg-emerald-50 text-emerald-600',
  reprovado: 'bg-red-50 text-red-600',
  concluido: 'bg-brand-50 text-brand-600',
}

const TIPOS = ['Atestado', 'Alteração cadastral', 'Benefícios', 'Declaração', 'Outros']

export default function Solicitacoes() {
  const { user, profile } = useAuth()
  const { push } = useToast()
  const [items, setItems] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    const query = supabase.from('rh_solicitacoes').select('*').order('created_at', { ascending: false })
    const { data } = profile?.role === 'admin' ? await query : await query.eq('user_id', user.id)
    setItems((data as Solicitacao[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile?.role])

  async function handleCreate(tipo: string, descricao: string) {
    if (!user) return
    const { error } = await supabase.from('rh_solicitacoes').insert({ user_id: user.id, tipo, descricao })
    if (error) {
      push('error', 'Não foi possível enviar a solicitação.')
      return
    }
    push('success', 'Solicitação enviada ao RH.')
    setModalOpen(false)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Solicitações de RH</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe solicitações enviadas ao Recursos Humanos.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Nova solicitação
        </button>
      </div>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Users} title="Nenhuma solicitação enviada ainda" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-navy-900">{s.tipo}</p>
                  <p className="text-sm text-slate-500">{s.descricao}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[s.status]}`}>{STATUS_LABEL[s.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewSolicitacaoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </div>
  )
}

function NewSolicitacaoModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (tipo: string, descricao: string) => void }) {
  const [tipo, setTipo] = useState('')
  const [descricao, setDescricao] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave(tipo, descricao)
    setTipo('')
    setDescricao('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova solicitação de RH">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Tipo</label>
          <select
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Selecione...</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Descrição</label>
          <textarea
            required
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Enviar solicitação
        </button>
      </form>
    </Modal>
  )
}
