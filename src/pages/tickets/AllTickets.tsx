import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TicketsTable } from '../../components/TicketsTable'
import type { Ticket, TicketCategory } from '../../types/database'

export default function AllTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Record<string, TicketCategory>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: allTickets }] = await Promise.all([
        supabase.from('ticket_categories').select('*'),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      ])
      if (cats) setCategories(Object.fromEntries(cats.map((c: TicketCategory) => [c.id, c])))
      if (allTickets) setTickets(allTickets as Ticket[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Todos os Chamados</h1>
      <p className="mt-1 text-sm text-slate-500">
        Visão geral dos chamados abertos na empresa. O que aparece aqui depende do seu perfil de acesso (RLS).
      </p>
      <div className="mt-5">
        <TicketsTable tickets={tickets} categories={categories} loading={loading} showViewAll={false} title="Chamados" />
      </div>
    </div>
  )
}
