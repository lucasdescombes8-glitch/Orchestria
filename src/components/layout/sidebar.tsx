'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Receipt,
  CalendarDays,
  TrendingUp,
  CheckSquare,
  Building2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/evenements', label: 'Événements', icon: Calendar },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/factures', label: 'Facturation', icon: Receipt },
  { href: '/calendrier', label: 'Calendrier', icon: CalendarDays },
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { href: '/taches', label: 'Tâches', icon: CheckSquare },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#C41230] flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-lg">Orchestria <span className="text-[#C41230]">/</span></span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#C41230] text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">Orchestria v1.0</p>
      </div>
    </div>
  )
}
