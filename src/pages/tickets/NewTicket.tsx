import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paperclip, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import type { TicketCategory, TicketPrioridade } from '../../types/database'

function generateTicketNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `#${year}${String(Date.now()).slice(-6)}${random}`.slice(0, 12)
}

export default function NewTicket() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { push } = useToast()
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [titulo, setTitulo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [prioridade, setPrioridade] = useState<TicketPrioridade>('media')
  const [descricao, setDescricao] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('ticket_categories').select('*').order('nome').then(({ data }) => {
      if (data) setCategories(data as TicketCategory[])
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('tickets').insert({
      numero: generateTicketNumber(),
      user_id: user.id,
      titulo,
      descricao,
      categoria_id: categoriaId || null,
      prioridade,
      status: 'aberto',
    })
    setSaving(false)
    if (error) {
      push('error', 'Não foi possível abrir o chamado. Tente novamente.')
      return
    }
    push('success', 'Chamado aberto com sucesso!')
    navigate('/chamados/meus')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-navy-900">Abrir Chamado</h1>
      <p className="mt-1 text-sm text-slate-500">Descreva sua solicitação e nossa equipe vai te atender.</p>

      <form onSubmit={handleSubmit} className="card-shadow mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Assunto</label>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Impressora não está funcionando"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Categoria</label>
            <select
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Prioridade</label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as TicketPrioridade)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Descrição</label>
          <textarea
            required
            rows={5}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o problema ou a solicitação com detalhes..."
            className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Anexo (opcional)</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3.5 py-2.5 text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600">
            <Paperclip className="h-4 w-4" />
            {fileName ?? 'Selecionar arquivo'}
            <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {saving ? 'Enviando...' : 'Abrir chamado'}
        </button>
      </form>
    </div>
  )
}
