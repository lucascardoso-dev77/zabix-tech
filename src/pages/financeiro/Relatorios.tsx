import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingState } from '../../components/LoadingState'

interface ContaRow {
  valor: number
  status: string
}

export default function Relatorios() {
  const [pagar, setPagar] = useState<ContaRow[]>([])
  const [receber, setReceber] = useState<ContaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('contas_pagar').select('valor, status'),
      supabase.from('contas_receber').select('valor, status'),
    ]).then(([p, r]) => {
      setPagar((p.data as ContaRow[]) ?? [])
      setReceber((r.data as ContaRow[]) ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingState label="Calculando relatório..." />

  const sum = (rows: ContaRow[], statuses?: string[]) =>
    rows.filter((r) => !statuses || statuses.includes(r.status)).reduce((s, r) => s + Number(r.valor), 0)

  const totalPagar = sum(pagar)
  const totalReceber = sum(receber)
  const saldo = totalReceber - totalPagar
  const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Relatórios Financeiros</h1>
      <p className="mt-1 text-sm text-slate-500">Consolidado de contas a pagar e a receber.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-shadow rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total a pagar</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{brl(totalPagar)}</p>
          <p className="mt-1 text-xs text-slate-400">Pendente/atrasado: {brl(sum(pagar, ['pendente', 'atrasado']))}</p>
        </div>
        <div className="card-shadow rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total a receber</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{brl(totalReceber)}</p>
          <p className="mt-1 text-xs text-slate-400">Pendente/atrasado: {brl(sum(receber, ['pendente', 'atrasado']))}</p>
        </div>
        <div className="card-shadow rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Saldo projetado</p>
          <p className={`mt-1 text-2xl font-bold ${saldo >= 0 ? 'text-brand-600' : 'text-red-600'}`}>{brl(saldo)}</p>
          <p className="mt-1 text-xs text-slate-400">Receber − Pagar</p>
        </div>
      </div>

      <div className="card-shadow mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Este relatório é calculado em tempo real a partir das tabelas <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">contas_pagar</code> e{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">contas_receber</code>. Para relatórios por período ou por categoria,
          adicione filtros de data às consultas desta página.
        </p>
      </div>
    </div>
  )
}
