import { ChevronRight, ShoppingCart, FileText, Boxes, Users, BookOpen, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface QuickAccessItem {
  label: string
  icon: LucideIcon
  to: string
}

const items: QuickAccessItem[] = [
  { label: 'Solicitar Compra', icon: ShoppingCart, to: '/compras/solicitar' },
  { label: 'Consulta de Notas Fiscais', icon: FileText, to: '/financeiro/contas-a-pagar' },
  { label: 'Consulta de Estoque', icon: Boxes, to: '/almoxarifado' },
  { label: 'Portal do Colaborador', icon: Users, to: '/rh/solicitacoes' },
  { label: 'Manuais e Tutoriais', icon: BookOpen, to: '/base-de-conhecimento' },
]

export function QuickAccess() {
  return (
    <div className="card-shadow rounded-xl border border-slate-200 bg-white">
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-[15px] font-semibold text-navy-900">Acesso Rápido</h3>
      </div>
      <ul>
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <li key={item.label} className={idx !== items.length - 1 ? 'border-b border-slate-100' : ''}>
              <Link to={item.to} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 transition hover:bg-slate-50">
                <Icon className="h-4 w-4 text-brand-500" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
