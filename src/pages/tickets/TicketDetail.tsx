import { useEffect, useState, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { StatusBadge } from '../../components/StatusBadge'
import { LoadingState } from '../../components/LoadingState'
import type { Profile, Ticket, TicketCategory, TicketComment, TicketStatus } from '../../types/database'

const STATUS_OPTIONS: TicketStatus[] = [
  'aberto', 'em_analise', 'em_atendimento', 'aguardando_usuario', 'aguardando_terceiro', 'resolvido', 'cancelado',
]

const STATUS_LABEL: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_usuario: 'Aguardando usuário',
  aguardando_terceiro: 'Aguardando terceiro',
  resolvido: 'Resolvido',
  cancelado: 'Cancelado',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { push } = useToast()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [category, setCategory] = useState<TicketCategory | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [commenters, setCommenters] = useState<Record<string, Profile>>({})
  const [technicians, setTechnicians] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingAssign, setSavingAssign] = useState(false)

  const canManage = profile?.role === 'admin' || profile?.role === 'tecnico'

  async function loadAll() {
    if (!id) return
    setLoading(true)

    const { data: t } = await supabase.from('tickets').select('*').eq('id', id).single()
    setTicket((t as Ticket) ?? null)

    if (t?.categoria_id) {
      const { data: c } = await supabase.from('ticket_categories').select('*').eq('id', t.categoria_id).single()
      setCategory((c as TicketCategory) ?? null)
    }

    const { data: cs } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })
    const commentList = (cs as TicketComment[]) ?? []
    setComments(commentList)

    const userIds = Array.from(new Set(commentList.map((c) => c.user_id)))
    if (userIds.length) {
      const { data: profs } = await supabase.from('profiles').select('*').in('user_id', userIds)
      setCommenters(Object.fromEntries(((profs as Profile[]) ?? []).map((p) => [p.user_id, p])))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!canManage) return
    supabase
      .from('profiles')
      .select('*')
      .in('role', ['tecnico', 'admin'])
      .then(({ data }) => setTechnicians((data as Profile[]) ?? []))
  }, [canManage])

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()
    if (!ticket || !newComment.trim()) return
    setSavingComment(true)
    const { data: userData } = await supabase.auth.getUser()
    const { error } = await supabase.from('ticket_comments').insert({
      ticket_id: ticket.id,
      user_id: userData.user!.id,
      comentario: newComment.trim(),
    })
    setSavingComment(false)
    if (error) {
      push('error', 'Não foi possível enviar o comentário.')
      return
    }
    setNewComment('')
    loadAll()
  }

  async function handleStatusChange(status: TicketStatus) {
    if (!ticket) return
    setSavingStatus(true)
    const patch: Partial<Ticket> = { status }
    if (status === 'resolvido') patch.resolved_at = new Date().toISOString()
    const { error } = await supabase.from('tickets').update(patch).eq('id', ticket.id)
    setSavingStatus(false)
    if (error) {
      push('error', 'Não foi possível atualizar o status.')
      return
    }
    setTicket({ ...ticket, ...patch } as Ticket)
    push('success', 'Status atualizado.')
  }

  async function handleAssign(tecnicoId: string) {
    if (!ticket) return
    setSavingAssign(true)
    const { error } = await supabase.from('tickets').update({ tecnico_id: tecnicoId || null }).eq('id', ticket.id)
    setSavingAssign(false)
    if (error) {
      push('error', 'Não foi possível atribuir o técnico.')
      return
    }
    setTicket({ ...ticket, tecnico_id: tecnicoId || null })
    push('success', 'Chamado atribuído.')
  }

  if (loading) return <LoadingState label="Carregando chamado..." />
  if (!ticket) return <p className="text-sm text-slate-500">Chamado não encontrado (ou você não tem acesso a ele).</p>

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/chamados/meus" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-brand-600">{ticket.numero}</p>
            <h1 className="mt-1 text-lg font-bold text-navy-900">{ticket.titulo}</h1>
            <p className="mt-1 text-xs text-slate-400">
              {category?.nome ?? 'Sem categoria'} · Aberto em {formatDateTime(ticket.created_at)}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {ticket.descricao && <p className="mt-4 whitespace-pre-line text-sm text-slate-600">{ticket.descricao}</p>}

        {canManage && (
          <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <UserCheck className="h-3.5 w-3.5" /> Atribuir a
              </label>
              <select
                value={ticket.tecnico_id ?? ''}
                disabled={savingAssign}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Não atribuído</option>
                {technicians.map((t) => (
                  <option key={t.user_id} value={t.user_id}>{t.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
              <select
                value={ticket.status}
                disabled={savingStatus}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card-shadow mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-navy-900">Comentários</h2>

        {comments.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum comentário ainda.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {(commenters[c.user_id]?.nome ?? '?').slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm">
                    <span className="font-medium text-navy-900">{commenters[c.user_id]?.nome ?? 'Usuário'}</span>{' '}
                    <span className="text-xs text-slate-400">{formatDateTime(c.created_at)}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">{c.comentario}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddComment} className="mt-5 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={savingComment || !newComment.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
