import type { TicketStatus } from '../types/database'

const STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_usuario: 'Aguardando você',
  aguardando_terceiro: 'Aguardando retorno',
  resolvido: 'Resolvido',
  cancelado: 'Cancelado',
}

const STATUS_CLASSES: Record<TicketStatus, string> = {
  aberto: 'bg-slate-100 text-slate-600',
  em_analise: 'bg-purple-50 text-purple-600',
  em_atendimento: 'bg-brand-50 text-brand-600',
  aguardando_usuario: 'bg-amber-50 text-amber-600',
  aguardando_terceiro: 'bg-amber-50 text-amber-600',
  resolvido: 'bg-emerald-50 text-emerald-600',
  cancelado: 'bg-red-50 text-red-600',
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
