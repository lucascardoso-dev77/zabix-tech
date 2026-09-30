import { Link } from 'react-router-dom'
import { ArrowRight, Ticket as TicketIcon } from 'lucide-react'
import type { Ticket, TicketCategory } from '../types/database'
import { StatusBadge } from './StatusBadge'
import { EmptyState } from './EmptyState'
import { SkeletonRow } from './LoadingState'

interface TicketsTableProps {
  tickets: Ticket[]
  categories: Record<string, TicketCategory>
  loading: boolean
  title?: string
  showViewAll?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function TicketsTable({ tickets, categories, loading, title = 'Meus Chamados', showViewAll = true }: TicketsTableProps) {
  return (
    <div className="card-shadow rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h3 className="text-[15px] font-semibold text-navy-900">{title}</h3>
        {showViewAll && (
          <Link to="/chamados/meus" className="text-xs font-medium text-brand-600 hover:underline">
            Ver todos
          </Link>
        )}
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="Nenhum chamado por aqui"
          description="Quando você abrir um chamado, ele aparece nesta lista."
          action={
            <Link to="/chamados/novo" className="mt-1 text-sm font-medium text-brand-600 hover:underline">
              Abrir chamado
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-2.5 font-medium">Nº Chamado</th>
                  <th className="px-3 py-2.5 font-medium">Assunto</th>
                  <th className="px-3 py-2.5 font-medium">Categoria</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Data Abertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-3 font-medium text-brand-600">
                      <Link to={`/chamados/${t.id}`} className="hover:underline">{t.numero}</Link>
                    </td>
                    <td className="max-w-xs truncate px-3 py-3 text-slate-700">{t.titulo}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {t.categoria_id ? categories[t.categoria_id]?.nome ?? '—' : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3"><StatusBadge status={t.status} /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-slate-100 sm:hidden">
            {tickets.map((t) => (
              <li key={t.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <Link to={`/chamados/${t.id}`} className="text-sm font-medium text-brand-600 hover:underline">{t.numero}</Link>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-1 text-sm text-slate-700">{t.titulo}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{t.categoria_id ? categories[t.categoria_id]?.nome ?? '—' : '—'}</span>
                  <span>{formatDate(t.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>

          {showViewAll && (
            <div className="border-t border-slate-100 px-6 py-3">
              <Link to="/chamados/meus" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                Ver todos os chamados <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
