import { useEffect, useState } from 'react'
import { Boxes, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EmptyState } from '../components/EmptyState'
import { SkeletonRow } from '../components/LoadingState'
import type { InventoryItem } from '../types/database'

export default function Almoxarifado() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('inventory').select('*').order('nome').then(({ data }) => {
      setItems((data as InventoryItem[]) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Almoxarifado</h1>
      <p className="mt-1 text-sm text-slate-500">Consulte estoque, entregas e movimentações.</p>

      <div className="card-shadow mt-5 rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Boxes} title="Nenhum item cadastrado no estoque" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-2.5 font-medium">Código</th>
                  <th className="px-3 py-2.5 font-medium">Item</th>
                  <th className="px-3 py-2.5 font-medium">Categoria</th>
                  <th className="px-3 py-2.5 font-medium">Localização</th>
                  <th className="px-3 py-2.5 font-medium">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const low = item.quantidade <= item.estoque_minimo
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-3 font-medium text-brand-600">{item.codigo}</td>
                      <td className="px-3 py-3 text-slate-700">{item.nome}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-500">{item.categoria ?? '—'}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-500">{item.localizacao ?? '—'}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className={`inline-flex items-center gap-1 font-medium ${low ? 'text-orange-600' : 'text-slate-700'}`}>
                          {low && <AlertTriangle className="h-3.5 w-3.5" />}
                          {item.quantidade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
