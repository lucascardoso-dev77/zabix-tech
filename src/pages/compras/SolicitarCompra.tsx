import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'

const CATEGORIAS = ['Equipamentos', 'Software e Licenças', 'Material de Escritório', 'Serviços', 'Outros']

function generatePurchaseNumber() {
  const year = new Date().getFullYear()
  return `PC-${year}-${String(Date.now()).slice(-6)}`
}

export default function SolicitarCompra() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { push } = useToast()
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('purchases').insert({
      numero: generatePurchaseNumber(),
      user_id: user.id,
      descricao,
      categoria,
      status: 'em_analise',
      valor: valor ? Number(valor) : null,
    })
    setSaving(false)
    if (error) {
      push('error', 'Não foi possível enviar a solicitação.')
      return
    }
    push('success', 'Solicitação de compra enviada!')
    navigate('/compras/acompanhar')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-navy-900">Solicitar Compra</h1>
      <p className="mt-1 text-sm text-slate-500">Abra uma nova solicitação de compra para aprovação.</p>

      <form onSubmit={handleSubmit} className="card-shadow mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">O que você precisa?</label>
          <textarea
            required
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: 2 notebooks para a equipe de suporte"
            className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Categoria</label>
            <select
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Selecione...</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Valor estimado (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {saving ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </div>
  )
}
