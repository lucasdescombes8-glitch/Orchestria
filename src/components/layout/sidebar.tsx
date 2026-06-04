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
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/clients', label: 'Entreprises', icon: Building2 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/evenements', label: 'Projets', icon: Calendar },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/factures', label: 'Facturation', icon: Receipt },
  { href: '/calendrier', label: 'Calendrier', icon: CalendarDays },
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { href: '/taches', label: 'Tâches', icon: CheckSquare },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#C41230] flex items-center justify-center shadow-lg shadow-red-900/40">
              <span className="text-white font-bold text-base tracking-tight">O</span>
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">Orchestria</span>
              <span className="text-[#C41230] font-bold text-base"> /</span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#C41230] text-white shadow-md shadow-red-900/30'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-150', isActive ? '' : 'group-hover:scale-110')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <p className="text-xs text-slate-600 text-center font-medium tracking-wide">PALAIS DE LA BOURSE · LYON</p>
      </div>
    </div>
  )
}
