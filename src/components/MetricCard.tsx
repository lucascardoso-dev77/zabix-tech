import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react'

export type MetricColor = 'blue' | 'green' | 'purple' | 'orange'

const colorMap: Record<MetricColor, string> = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
}

interface MetricCardProps {
  icon: LucideIcon
  color: MetricColor
  label: string
  value: string
  changePct: number
  changeIsGood: boolean
  caption?: string
}

export function MetricCard({ icon: Icon, color, label, value, changePct, changeIsGood, caption }: MetricCardProps) {
  const positive = changePct >= 0
  const trendColor = changeIsGood ? 'text-emerald-600' : 'text-red-500'
  const TrendIcon = positive ? ArrowUp : ArrowDown

  return (
    <div className="card-shadow flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-xl font-bold text-navy-900">{value}</span>
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(changePct)}%
          </span>
        </div>
        {caption && <p className="mt-0.5 truncate text-[11px] text-slate-400">{caption}</p>}
      </div>
    </div>
  )
}
