import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableHeaderProps {
  label: string
  field: string
  sort: string
  order: string
  searchParams: Record<string, string | undefined>
  className?: string
}

export function SortableHeader({ label, field, sort, order, searchParams, className }: SortableHeaderProps) {
  const isActive = sort === field
  const nextOrder = isActive && order === 'asc' ? 'desc' : 'asc'

  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => { if (v) params.set(k, v) })
  params.set('sort', field)
  params.set('order', nextOrder)

  return (
    <Link
      href={`?${params.toString()}`}
      className={cn(
        'inline-flex items-center gap-1 group select-none transition-colors',
        isActive ? 'text-[#C41230]' : 'text-gray-500 hover:text-gray-900',
        className
      )}
    >
      {label}
      {isActive
        ? order === 'asc'
          ? <ChevronUp className="h-3.5 w-3.5 text-[#C41230]" />
          : <ChevronDown className="h-3.5 w-3.5 text-[#C41230]" />
        : <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
      }
    </Link>
  )
}
