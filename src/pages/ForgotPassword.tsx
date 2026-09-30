import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import logoIcon from '../assets/logo-zabix-icon.png'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) return setError(error)
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src={logoIcon} alt="Zabix Tech" className="h-9 w-9 object-contain" />
          <div className="leading-none">
            <p className="text-lg font-extrabold tracking-wide text-navy-900">ZABIX</p>
            <p className="text-[9px] tracking-[0.3em] text-slate-400">TECH</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <h2 className="text-lg font-bold text-navy-900">Verifique seu e-mail</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enviamos um link de redefinição de senha para <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-center text-lg font-bold text-navy-900">Esqueci minha senha</h2>
            <p className="mt-1.5 text-center text-sm text-slate-500">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@empresa.com"
                  className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          </>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
        </Link>
      </div>
    </div>
  )
}
