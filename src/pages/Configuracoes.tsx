import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'

export default function Configuracoes() {
  const { profile, user } = useAuth()
  const { push } = useToast()
  const [nome, setNome] = useState(profile?.nome ?? '')
  const [cargo, setCargo] = useState(profile?.cargo ?? '')
  const [departamento, setDepartamento] = useState(profile?.departamento ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ nome, cargo, departamento }).eq('id', profile.id)
    setSaving(false)
    if (error) return push('error', 'Não foi possível salvar as alterações.')
    push('success', 'Perfil atualizado.')
  }

  async function handleChangePassword() {
    if (!user?.email) return
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) return push('error', 'Não foi possível enviar o e-mail de redefinição.')
    push('success', 'Enviamos um link de redefinição de senha para o seu e-mail.')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">Configurações</h1>
        <p className="mt-1 text-sm text-slate-500">Preferências da sua conta.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-shadow space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-navy-900">Meu perfil</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">E-mail</label>
          <input
            disabled
            value={user?.email ?? ''}
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Cargo</label>
            <input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Departamento</label>
            <input
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-navy-900">Segurança</h2>
        <p className="mt-1 text-sm text-slate-500">Enviaremos um link por e-mail para você definir uma nova senha.</p>
        <button
          onClick={handleChangePassword}
          className="mt-3 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Alterar minha senha
        </button>
      </div>
    </div>
  )
}
