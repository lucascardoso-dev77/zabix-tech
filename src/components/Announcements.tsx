import { Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Announcement } from '../types/database'
import { EmptyState } from './EmptyState'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function Announcements({ items, loading }: { items: Announcement[]; loading: boolean }) {
  return (
    <div className="card-shadow rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-[15px] font-semibold text-navy-900">Comunicados</h3>
        <Link to="/comunicados" className="text-xs font-medium text-brand-600 hover:underline">
          Ver todos
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 px-5 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhum comunicado no momento" />
      ) : (
        <ul className="divide-y divide-slate-100 px-2 pb-2">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 px-3 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <Megaphone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-navy-900">{item.titulo}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-500">{item.descricao}</p>
                <p className="mt-1 text-[11px] text-slate-400">{formatDate(item.data_publicacao)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
