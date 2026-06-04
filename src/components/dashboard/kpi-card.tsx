import { Card, CardContent } from '@/components/ui/card'
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
  color?: 'indigo' | 'green' | 'yellow' | 'red'
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }: KpiCardProps) {
  const colorMap = {
    indigo: 'bg-[#FDF2F4] text-[#C41230]',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn('text-xs font-medium mt-2', trend.positive ? 'text-green-600' : 'text-red-600')}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
