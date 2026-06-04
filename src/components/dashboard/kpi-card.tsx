import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  color?: 'red' | 'green' | 'blue' | 'amber'
}

const colorMap = {
  red:   { bg: 'bg-[#C41230]', light: 'bg-red-50',   text: 'text-[#C41230]',   ring: 'ring-red-100' },
  green: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  blue:  { bg: 'bg-blue-500',  light: 'bg-blue-50',  text: 'text-blue-600',  ring: 'ring-blue-100' },
  amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, color = 'red' }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center ring-4', c.light, c.ring)}>
          <Icon className={cn('h-5 w-5', c.text)} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full',
            trend.positive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-500'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}
