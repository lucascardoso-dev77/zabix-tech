import { useEffect, useState } from 'react'
import {
  Headset, ClipboardList, ShoppingCart, Boxes, Wallet, Users, BookOpen,
  Clock, CheckCircle2, ShoppingBag, TicketCheck,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DashboardBanner } from '../components/DashboardBanner'
import { ServiceCard } from '../components/ServiceCard'
import { QuickAccess } from '../components/QuickAccess'
import { Announcements } from '../components/Announcements'
import { TicketsTable } from '../components/TicketsTable'
import { MetricCard } from '../components/MetricCard'
import type { Announcement, Ticket, TicketCategory } from '../types/database'

const services = [
  { title: 'Abrir Chamado', description: 'Solicite suporte ou faça uma requisição', icon: Headset, color: 'blue' as const, to: '/chamados/novo' },
  { title: 'Meus Chamados', description: 'Acompanhe o status das suas solicitações', icon: ClipboardList, color: 'green' as const, to: '/chamados/meus' },
  { title: 'Compras', description: 'Solicite cotações, pedidos e acompanhe', icon: ShoppingCart, color: 'purple' as const, to: '/compras/acompanhar' },
  { title: 'Almoxarifado', description: 'Consulte estoque, entregas e movimentações', icon: Boxes, color: 'orange' as const, to: '/almoxarifado' },
  { title: 'Financeiro', description: 'Contas a pagar, contas a receber e relatórios', icon: Wallet, color: 'teal' as const, to: '/financeiro/contas-a-pagar' },
  { title: 'RH', description: 'Férias, benefícios e solicitações', icon: Users, color: 'pink' as const, to: '/rh/solicitacoes' },
  { title: 'Solicitar Compra', description: 'Abra uma nova solicitação de compra', icon: ShoppingBag, color: 'blue' as const, to: '/compras/solicitar' },
  { title: 'Base de Conhecimento', description: 'Tire suas dúvidas e encontre soluções', icon: BookOpen, color: 'gray' as const, to: '/base-de-conhecimento' },
]

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Record<string, TicketCategory>>({})
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [openCount, setOpenCount] = useState<number | null>(null)
  const [resolvedPct, setResolvedPct] = useState<number | null>(null)
  const [purchasesInProgress, setPurchasesInProgress] = useState<number | null>(null)
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      setLoadingTickets(true)
      const [{ data: cats }, { data: myTickets }, { data: allTickets }, { data: purchases }] = await Promise.all([
        supabase.from('ticket_categories').select('*'),
        supabase.from('tickets').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('tickets').select('status').eq('user_id', user!.id),
        supabase.from('purchases').select('id, status').eq('user_id', user!.id),
      ])

      if (cats) {
        setCategories(Object.fromEntries(cats.map((c: TicketCategory) => [c.id, c])))
      }
      if (myTickets) setTickets(myTickets as Ticket[])

      if (allTickets) {
        const statusRows = allTickets as Pick<Ticket, 'status'>[]
        const abertos = statusRows.filter((t) => !['resolvido', 'cancelado'].includes(t.status)).length
        const resolvidos = statusRows.filter((t) => t.status === 'resolvido').length
        setOpenCount(abertos)
        setResolvedPct(statusRows.length ? Math.round((resolvidos / statusRows.length) * 100) : 0)
      }
      if (purchases) {
        const purchaseRows = purchases as { id: string; status: string }[]
        setPurchasesInProgress(purchaseRows.filter((p) => !['concluida', 'cancelada'].includes(p.status)).length)
      }
      setLoadingTickets(false)
    }

    async function loadAnnouncements() {
      setLoadingAnnouncements(true)
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('ativo', true)
        .order('data_publicacao', { ascending: false })
        .limit(3)
      setAnnouncements((data as Announcement[]) ?? [])
      setLoadingAnnouncements(false)
    }

    load()
    loadAnnouncements()
  }, [user])

  const firstName = profile?.nome ?? 'usuário'

  return (
    <div className="space-y-6">
      <DashboardBanner nome={firstName} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>

          <TicketsTable tickets={tickets} categories={categories} loading={loadingTickets} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={TicketCheck}
              color="blue"
              label="Chamados em aberto"
              value={openCount === null ? '—' : String(openCount)}
              changePct={20}
              changeIsGood={false}
              caption="em relação ao mês anterior"
            />
            <MetricCard
              icon={Clock}
              color="purple"
              label="Tempo médio de atendimento"
              value="2h 35min"
              changePct={35}
              changeIsGood={false}
              caption="em relação ao mês anterior"
            />
            <MetricCard
              icon={CheckCircle2}
              color="green"
              label="Chamados resolvidos"
              value={resolvedPct === null ? '—' : `${resolvedPct}%`}
              changePct={12}
              changeIsGood={true}
              caption="em relação ao mês anterior"
            />
            <MetricCard
              icon={ShoppingCart}
              color="orange"
              label="Compras em andamento"
              value={purchasesInProgress === null ? '—' : String(purchasesInProgress)}
              changePct={33}
              changeIsGood={true}
              caption="em relação ao mês anterior"
            />
          </div>
        </div>

        <div className="space-y-6">
          <QuickAccess />
          <Announcements items={announcements} loading={loadingAnnouncements} />
        </div>
      </div>
    </div>
  )
}
