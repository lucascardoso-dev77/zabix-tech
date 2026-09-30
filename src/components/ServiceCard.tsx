import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export type ServiceColor = 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'pink' | 'gray'

const colorMap: Record<ServiceColor, string> = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-rose-50 text-rose-600',
  gray: 'bg-slate-100 text-slate-500',
}

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: ServiceColor
  to: string
}

export function ServiceCard({ title, description, icon: Icon, color, to }: ServiceCardProps) {
  return (
    <Link
      to={to}
      className="group card-shadow relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-[15px] font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 text-sm leading-snug text-slate-500">{description}</p>
      <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  )
}
