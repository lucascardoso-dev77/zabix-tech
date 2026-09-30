import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonRow } from '../../components/LoadingState'

type ContaStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado'

interface Conta {
  id: string
  descricao: string
  valor: number
  vencimento: string
  status: ContaStatus
  fornecedor?: string | null
  cliente?: string | null
}

const STATUS_LABEL: Record<ContaStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
}

const STATUS_CLASS: Record<ContaStatus, string> = {
  pendente: 'bg-amber-50 text-amber-600',
  pago: 'bg-emerald-50 text-emerald-600',
  atrasado: 'bg-red-50 text-red-600',
  cancelado: 'bg-slate-100 text-slate-500',
}

interface ContasModuleProps {
  table: 'contas_pagar' | 'contas_receber'
  title: string
  description: string
  partyLabel: string // "Fornecedor" ou "Cliente"
  partyField: 'fornecedor' | 'cliente'
}

export function ContasModule({ table, title, description, partyLabel, partyField }: ContasModuleProps) {
  const { profile } = useAuth()
  const { push } = useToast()
  const isAdmin = profile?.role === 'admin'

  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from(table).select('*').order('vencimento')
    if (!error) setContas((data as Conta[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table])

  const total = contas.reduce((sum, c) => sum + Number(c.valor), 0)
  const totalPendente = contas.filter((c) => c.status === 'pendente' || c.status === 'atrasado').reduce((s, c) => s + Number(c.valor), 0)

  async function handleCreate(payload: { descricao: string; valor: number; vencimento: string; party: string }) {
    const { data: userData } = await supabase.auth.getUser()
    const { error } = await supabase.from(table).insert({
      descricao: payload.descricao,
      valor: payload.valor,
      vencimento: payload.vencimento,
      status: 'pendente',
      created_by: userData.user?.id,
      [partyField]: payload.party || null,
    })
    if (error) {
      push('error', 'Não foi possível salvar. Apenas administradores podem lançar contas.')
      return
    }
    push('success', 'Lançamento adicionado.')
    setModalOpen(false)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Novo lançamento
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card-shadow rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total lançado</p>
          <p className="mt-1 text-xl font-bold text-navy-900">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="card-shadow rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Pendente / atrasado</p>
          <p className="mt-1 text-xl font-bold text-amber-600">{totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</div>
        ) : contas.length === 0 ? (
          <EmptyState icon={Wallet} title="Nenhum lançamento ainda" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-2.5 font-medium">Descrição</th>
                  <th className="px-3 py-2.5 font-medium">{partyLabel}</th>
                  <th className="px-3 py-2.5 font-medium">Valor</th>
                  <th className="px-3 py-2.5 font-medium">Vencimento</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-700">{c.descricao}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{c[partyField] ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {Number(c.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {new Date(c.vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewContaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} partyLabel={partyLabel} />
    </div>
  )
}

function NewContaModal({
  open,
  onClose,
  onSave,
  partyLabel,
}: {
  open: boolean
  onClose: () => void
  onSave: (payload: { descricao: string; valor: number; vencimento: string; party: string }) => void
  partyLabel: string
}) {
  const [descricao, setDescricao] = useState('')
  const [party, setParty] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave({ descricao, party, valor: Number(valor), vencimento })
    setDescricao('')
    setParty('')
    setValor('')
    setVencimento('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo lançamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Descrição</label>
          <input
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">{partyLabel}</label>
          <input
            value={party}
            onChange={(e) => setParty(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Valor (R$)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Vencimento</label>
            <input
              type="date"
              required
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Salvar lançamento
        </button>
      </form>
    </Modal>
  )
}
