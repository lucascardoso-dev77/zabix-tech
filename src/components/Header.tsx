import { useState } from 'react'
import { Search, Bell, HelpCircle, Grid3x3, ChevronDown, LogOut, Settings, User as UserIcon, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function initials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Pesquisar no sistema..."
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

export function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <button className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Notificações">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  )
}

export function UserMenu() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const name = profile?.nome ?? 'Usuário'
  const cargo = profile?.cargo ?? ''

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initials(name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-navy-900">{name}</span>
          {cargo && <span className="block text-xs text-slate-400">{cargo}</span>}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg">
            <MenuLink icon={UserIcon} label="Meu perfil" />
            <MenuLink icon={Settings} label="Configurações" />
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MenuLink({ icon: Icon, label }: { icon: typeof UserIcon; label: string }) {
  return (
    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
      <Icon className="h-4 w-4 text-slate-400" /> {label}
    </button>
  )
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <button onClick={onOpenMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </button>
      <SearchBar />
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <NotificationBell count={3} />
        <button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Ajuda">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:block" aria-label="Aplicativos">
          <Grid3x3 className="h-5 w-5" />
        </button>
        <div className="ml-1 h-6 w-px bg-slate-200" />
        <UserMenu />
      </div>
    </header>
  )
}
