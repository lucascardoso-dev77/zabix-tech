import logoFull from '../assets/logo-zabix-full.png'

export function DashboardBanner({ nome }: { nome: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-8 sm:px-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(56,208,255,0.25), transparent 40%), radial-gradient(circle at 85% 80%, rgba(31,123,245,0.35), transparent 45%)',
        }}
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M 34 0 L 0 0 0 34" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold text-white sm:text-[26px]">Olá, {nome}!</h1>
          <p className="mt-1.5 text-[15px] text-slate-300">Bem-vindo ao seu portal de serviços da Zabix Tech.</p>
          <p className="mt-1 text-sm text-slate-400">
            Aqui você pode abrir chamados, acompanhar solicitações, realizar compras e muito mais.
          </p>
        </div>
        <div className="shrink-0 self-stretch sm:self-center">
          <img src={logoFull} alt="Zabix Tech" className="h-11 w-auto object-contain opacity-95" />
        </div>
      </div>
    </div>
  )
}
