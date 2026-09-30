import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { TicketsTable } from '../../components/TicketsTable'
import type { Ticket, TicketCategory } from '../../types/database'

export default function MyTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Record<string, TicketCategory>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [{ data: cats }, { data: myTickets }] = await Promise.all([
        supabase.from('ticket_categories').select('*'),
        supabase.from('tickets').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ])
      if (cats) setCategories(Object.fromEntries(cats.map((c: TicketCategory) => [c.id, c])))
      if (myTickets) setTickets(myTickets as Ticket[])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Meus Chamados</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe o andamento de todas as suas solicitações.</p>
        </div>
        <Link
          to="/chamados/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Abrir Chamado
        </Link>
      </div>

      <TicketsTable tickets={tickets} categories={categories} loading={loading} showViewAll={false} />
    </div>
  )
}
