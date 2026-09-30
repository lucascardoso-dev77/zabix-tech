import { useEffect, useState, type FormEvent } from 'react'
import { Plus, KeyRound, UserCog, Copy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import { Modal } from '../../components/Modal'
import { SkeletonRow } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import type { AppRole, Profile } from '../../types/database'

const ROLE_LABEL: Record<AppRole, string> = {
  usuario: 'Usuário (abre chamados)',
  tecnico: 'Técnico (atende chamados)',
  admin: 'Administrador',
}

const ROLE_BADGE: Record<AppRole, string> = {
  usuario: 'bg-slate-100 text-slate-600',
  tecnico: 'bg-brand-50 text-brand-600',
  admin: 'bg-purple-50 text-purple-600',
}

export default function UserManagement() {
  const { push } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [savingRole, setSavingRole] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('nome')
    if (error) {
      push('error', 'Não foi possível carregar os usuários. Verifique se você está logado como administrador.')
    } else {
      setUsers((data as Profile[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleRoleChange(profile: Profile, role: AppRole) {
    setSavingRole(profile.id)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', profile.id)
    setSavingRole(null)
    if (error) {
      push('error', 'Não foi possível atualizar o perfil de acesso.')
      return
    }
    setUsers((prev) => prev.map((u) => (u.id === profile.id ? { ...u, role } : u)))
    push('success', `${profile.nome} agora é ${ROLE_LABEL[role]}.`)
  }

  async function handleResetPassword(profile: Profile) {
    setResettingId(profile.id)
    const { data, error } = await supabase.functions.invoke('admin-reset-password', {
      body: { userId: profile.user_id },
    })
    setResettingId(null)
    if (error || data?.error) {
      push(
        'error',
        'Não foi possível resetar a senha. Confirme se a função "admin-reset-password" foi publicada no seu projeto Supabase.'
      )
      return
    }
    push('success', `Nova senha temporária para ${profile.nome}: ${data.senhaTemporaria}`)
    navigator.clipboard?.writeText(data.senhaTemporaria).catch(() => {})
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie acessos e defina quem pode abrir chamados (usuário) e quem vai atender (técnico).
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Novo usuário
        </button>
      </div>

      <div className="card-shadow rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">{[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="Nenhum usuário encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-2.5 font-medium">Nome</th>
                  <th className="px-3 py-2.5 font-medium">E-mail</th>
                  <th className="px-3 py-2.5 font-medium">Cargo</th>
                  <th className="px-3 py-2.5 font-medium">Perfil de acesso</th>
                  <th className="px-3 py-2.5 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-3 font-medium text-navy-900">{u.nome}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{u.email}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{u.cargo ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <select
                        value={u.role}
                        disabled={savingRole === u.id}
                        onChange={(e) => handleRoleChange(u, e.target.value as AppRole)}
                        className={`rounded-md border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-200 ${ROLE_BADGE[u.role]}`}
                      >
                        {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <button
                        onClick={() => handleResetPassword(u)}
                        disabled={resettingId === u.id}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        {resettingId === u.id ? 'Resetando...' : 'Resetar senha'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false)
          loadUsers()
        }}
      />
    </div>
  )
}

function CreateUserModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { push } = useToast()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('')
  const [role, setRole] = useState<AppRole>('usuario')
  const [saving, setSaving] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; senha: string } | null>(null)

  function reset() {
    setNome('')
    setEmail('')
    setCargo('')
    setRole('usuario')
    setCredentials(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: { nome, email, cargo, role },
    })
    setSaving(false)

    if (error || data?.error) {
      push(
        'error',
        data?.error ?? 'Não foi possível criar o usuário. Confirme se a função "admin-create-user" foi publicada no seu projeto Supabase.'
      )
      return
    }

    setCredentials({ email, senha: data.senhaTemporaria })
    onCreated()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Novo usuário"
    >
      {credentials ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Usuário criado! Compartilhe a senha temporária abaixo com <strong>{credentials.email}</strong> por um canal seguro.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <code className="text-sm font-medium text-navy-900">{credentials.senha}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(credentials.senha)}
              className="text-slate-400 hover:text-brand-600"
              aria-label="Copiar senha"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              reset()
              onClose()
            }}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Concluir
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Nome completo</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Cargo</label>
            <input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Analista Financeiro"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-900">Perfil de acesso</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="usuario">Usuário — só abre chamados</option>
              <option value="tecnico">Técnico — atende chamados</option>
              <option value="admin">Administrador — acesso total</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      )}
    </Modal>
  )
}
