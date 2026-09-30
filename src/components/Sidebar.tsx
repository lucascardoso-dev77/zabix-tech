import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Headset, ClipboardList, ListChecks, BookOpen, ShoppingCart, PackageSearch,
  Boxes, Wallet, Receipt, BarChart3, Users, CalendarDays, Clock, Settings,
  ChevronDown, X, UserCog,
} from 'lucide-react'
import logoFull from '../assets/logo-zabix-full.png'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  label: string
  to?: string
  icon: typeof Home
}

interface NavGroup {
  heading: string
  items: NavItem[]
}

const singleItems: NavItem[] = [{ label: 'Início', to: '/', icon: Home }]

const groups: NavGroup[] = [
  {
    heading: 'Atendimento',
    items: [
      { label: 'Abrir Chamado', to: '/chamados/novo', icon: Headset },
      { label: 'Meus Chamados', to: '/chamados/meus', icon: ClipboardList },
      { label: 'Todos os Chamados', to: '/chamados/todos', icon: ListChecks },
      { label: 'Base de Conhecimento', to: '/base-de-conhecimento', icon: BookOpen },
    ],
  },
  {
    heading: 'Compras',
    items: [
      { label: 'Solicitar Compra', to: '/compras/solicitar', icon: ShoppingCart },
      { label: 'Acompanhar Compras', to: '/compras/acompanhar', icon: PackageSearch },
      { label: 'Almoxarifado', to: '/almoxarifado', icon: Boxes },
    ],
  },
  {
    heading: 'Financeiro',
    items: [
      { label: 'Contas a Pagar', to: '/financeiro/contas-a-pagar', icon: Wallet },
      { label: 'Contas a Receber', to: '/financeiro/contas-a-receber', icon: Receipt },
      { label: 'Relatórios', to: '/financeiro/relatorios', icon: BarChart3 },
    ],
  },
  {
    heading: 'RH',
    items: [
      { label: 'Solicitações', to: '/rh/solicitacoes', icon: Users },
      { label: 'Férias', to: '/rh/ferias', icon: CalendarDays },
      { label: 'Ponto', to: '/rh/ponto', icon: Clock },
    ],
  },
  {
    heading: 'Configurações',
    items: [{ label: 'Configurações', to: '/configuracoes', icon: Settings }],
  },
]

const adminGroup: NavGroup = {
  heading: 'Administração',
  items: [{ label: 'Usuários', to: '/admin/usuarios', icon: UserCog }],
}

function SidebarContent() {
  const location = useLocation()
  const { profile } = useAuth()
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const visibleGroups = profile?.role === 'admin' ? [...groups, adminGroup] : groups

  function toggleGroup(heading: string) {
    setCollapsedGroups((prev) => ({ ...prev, [heading]: !prev[heading] }))
  }

  function isActive(to?: string) {
    if (!to) return false
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-navy-950 text-slate-300">
      <div className="flex items-center px-5 py-6">
        <img src={logoFull} alt="Zabix Tech" className="h-8 w-auto object-contain" />
      </div>

      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 pb-4">
        <ul className="mb-1 space-y-0.5">
          {singleItems.map((item) => (
            <SidebarLink key={item.label} item={item} active={isActive(item.to)} />
          ))}
        </ul>

        {visibleGroups.map((group) => (
          <div key={group.heading} className="mt-5">
            <button
              onClick={() => toggleGroup(group.heading)}
              className="flex w-full items-center justify-between px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-400"
            >
              {group.heading}
            </button>
            {!collapsedGroups[group.heading] && (
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink key={item.label} item={item} active={isActive(item.to)} withChevron />
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 px-5 py-5">
        <img src={logoFull} alt="Zabix Tech" className="mb-2.5 h-6 w-auto object-contain" />
        <p className="text-[11px] leading-relaxed text-slate-500">Tecnologia que conecta sua empresa.</p>
      </div>
    </div>
  )
}

function SidebarLink({ item, active, withChevron }: { item: NavItem; active: boolean; withChevron?: boolean }) {
  const Icon = item.icon
  return (
    <li>
      <NavLink
        to={item.to ?? '#'}
        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
          active ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
        <span className="flex-1 truncate">{item.label}</span>
        {withChevron && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
      </NavLink>
    </li>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden shrink-0 lg:block">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className="relative h-full w-64 animate-[slideIn_0.2s_ease-out]">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg bg-white/10 p-1.5 text-white"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </div>
    </div>
  )
}
