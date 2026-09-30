import { ShieldCheck, Headset, ClipboardList, ShoppingCart, BookOpen } from 'lucide-react'
import logoFull from '../assets/logo-zabix-full.png'
import logoIcon from '../assets/logo-zabix-icon.png'
import officeBg from '../assets/login-office-bg.jpg'
import { LoginForm } from '../components/LoginForm'

const highlights = [
  { icon: Headset, title: 'Suporte Técnico', desc: 'Atendimento rápido e eficiente' },
  { icon: ClipboardList, title: 'Abertura de Chamados', desc: 'Acompanhe o status em tempo real' },
  { icon: ShoppingCart, title: 'Compras e Suprimentos', desc: 'Mais controle e agilidade' },
  { icon: BookOpen, title: 'Base de Conhecimento', desc: 'Tire suas dúvidas e encontre soluções' },
]

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Lado esquerdo */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-navy-950 px-8 py-10 sm:px-14 sm:py-12 lg:w-[52%] lg:px-16">
        <img
          src={officeBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-950/90 to-navy-900/80" />

        <div className="relative">
          <div className="mb-14">
            <img src={logoFull} alt="Zabix Tech" className="h-11 w-auto object-contain" />
          </div>

          <h1 className="max-w-md text-3xl font-bold leading-tight text-white sm:text-[34px]">
            Tecnologia que impulsiona
            <br /> o seu <span className="text-cyan-accent">negócio.</span>
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-300">
            Soluções em TI, suporte e sistemas para uma empresa mais produtiva e conectada.
          </p>

          <ul className="mt-10 space-y-6">
            {highlights.map((h) => (
              <li key={h.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-accent">
                  <h.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{h.title}</p>
                  <p className="text-[13px] text-slate-400">{h.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p
          className="relative mt-12 text-2xl text-cyan-accent/90"
          style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
        >
          Juntos por
          <br /> mais resultados!
        </p>
      </div>

      {/* Lado direito */}
      <div className="flex w-full flex-1 flex-col bg-slate-50 px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex justify-end">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" /> Ambiente Seguro
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-9 shadow-sm sm:px-10">
            <div className="mb-7 flex items-center justify-center gap-2">
              <img src={logoIcon} alt="Zabix Tech" className="h-9 w-9 object-contain" />
              <div className="leading-none">
                <p className="text-lg font-extrabold tracking-wide text-navy-900">ZABIX</p>
                <p className="text-[9px] tracking-[0.3em] text-slate-400">TECH</p>
              </div>
            </div>

            <h2 className="text-center text-xl font-bold text-navy-900">Acesse o seu portal</h2>
            <p className="mt-1.5 text-center text-sm text-slate-500">
              Digite seu usuário e senha para continuar.
            </p>

            <div className="mt-7">
              <LoginForm />
            </div>
          </div>
        </div>

        <footer className="flex flex-col items-center gap-1 pb-2 text-center">
          <p className="text-sm font-semibold text-navy-900">Zabix Tech</p>
          <p className="text-xs text-slate-400">Tecnologia | Suporte | Soluções</p>
        </footer>
        <p className="pb-1 text-right text-[11px] text-slate-300">v2.8.0</p>
      </div>
    </div>
  )
}
