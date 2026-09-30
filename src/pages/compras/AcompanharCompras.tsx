import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonRow } from '../../components/LoadingState'
import type { Purchase } from '../../types/database'

const STATUS_LABEL: Record<string, string> = {
  em_analise: 'Em análise',
  aprovada: 'Aprovada',
  em_cotacao: 'Em cotação',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

const STATUS_CLASS: Record<string, string> = {
  em_analise: 'bg-purple-50 text-purple-600',
  aprovada: 'bg-brand-50 text-brand-600',
  em_cotacao: 'bg-amber-50 text-amber-600',
  concluida: 'bg-emerald-50 text-emerald-600',
  cancelada: 'bg-red-50 text-red-600',
}

export default function AcompanharCompras() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPurchases((data as Purchase[]) ?? [])
        setLoading(false)
      })
  }, [user])

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Acompanhar Compras</h1>
          <p className="mt-1 text-sm text-slate-500">Veja o status das suas solicitações de compra.</p>
        </div>
        <Link to="/compras/solicitar" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Nova solicitação
        </Link>
      </div>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</div>
        ) : purchases.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Nenhuma solicitação de compra ainda" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-2.5 font-medium">Nº</th>
                  <th className="px-3 py-2.5 font-medium">Descrição</th>
                  <th className="px-3 py-2.5 font-medium">Categoria</th>
                  <th className="px-3 py-2.5 font-medium">Valor</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-3 font-medium text-brand-600">{p.numero}</td>
                    <td className="max-w-xs truncate px-3 py-3 text-slate-700">{p.descricao}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{p.categoria ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {p.valor != null ? p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
