import { useEffect, useState } from 'react'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'

interface PontoRow {
  id: string
  data: string
  entrada: string | null
  saida: string | null
}

function hora(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Ponto() {
  const { user } = useAuth()
  const { push } = useToast()
  const [registros, setRegistros] = useState<PontoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const hoje = new Date().toISOString().slice(0, 10)
  const registroHoje = registros.find((r) => r.data === hoje) ?? null

  async function load() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('ponto').select('*').eq('user_id', user.id).order('data', { ascending: false }).limit(15)
    setRegistros((data as PontoRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleEntrada() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('ponto').insert({ user_id: user.id, data: hoje, entrada: new Date().toISOString() })
    setSaving(false)
    if (error) return push('error', 'Não foi possível registrar a entrada.')
    push('success', 'Entrada registrada.')
    load()
  }

  async function handleSaida() {
    if (!registroHoje) return
    setSaving(true)
    const { error } = await supabase.from('ponto').update({ saida: new Date().toISOString() }).eq('id', registroHoje.id)
    setSaving(false)
    if (error) return push('error', 'Não foi possível registrar a saída.')
    push('success', 'Saída registrada.')
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Ponto</h1>
      <p className="mt-1 text-sm text-slate-500">Consulte seus registros de ponto e horas trabalhadas.</p>

      <div className="card-shadow mt-5 flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-navy-900">Hoje, {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="text-sm text-slate-500">
              Entrada: <span className="font-medium text-navy-900">{hora(registroHoje?.entrada ?? null)}</span> · Saída:{' '}
              <span className="font-medium text-navy-900">{hora(registroHoje?.saida ?? null)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEntrada}
            disabled={saving || !!registroHoje?.entrada}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            <LogIn className="h-4 w-4" /> Registrar entrada
          </button>
          <button
            onClick={handleSaida}
            disabled={saving || !registroHoje?.entrada || !!registroHoje?.saida}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <LogOut className="h-4 w-4" /> Registrar saída
          </button>
        </div>
      </div>

      <div className="card-shadow mt-5 rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <LoadingState />
        ) : registros.length === 0 ? (
          <EmptyState icon={Clock} title="Nenhum registro de ponto ainda" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-2.5 font-medium">Data</th>
                <th className="px-3 py-2.5 font-medium">Entrada</th>
                <th className="px-3 py-2.5 font-medium">Saída</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 text-slate-700">{new Date(r.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-3 text-slate-500">{hora(r.entrada)}</td>
                  <td className="px-3 py-3 text-slate-500">{hora(r.saida)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
