import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EmptyState } from '../components/EmptyState'
import { SkeletonRow } from '../components/LoadingState'
import type { Announcement } from '../types/database'

export default function ComunicadosTodos() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('data_publicacao', { ascending: false })
      .then(({ data }) => {
        setItems((data as Announcement[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Comunicados</h1>
      <p className="mt-1 text-sm text-slate-500">Todos os comunicados publicados pela empresa.</p>

      <div className="card-shadow mt-5 rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Megaphone} title="Nenhum comunicado publicado" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((a) => (
              <li key={a.id} className="flex gap-3 px-6 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{a.titulo}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{a.descricao}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(a.data_publicacao).toLocaleDateString('pt-BR')}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
