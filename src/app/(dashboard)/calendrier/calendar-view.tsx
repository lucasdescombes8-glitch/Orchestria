'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const statutColors: Record<string, string> = {
  PROSPECTION: 'bg-gray-400',
  OPTION: 'bg-blue-400',
  CONFIRME: 'bg-green-500',
  EN_COURS: 'bg-purple-500',
  REALISE: 'bg-emerald-500',
  ANNULE: 'bg-red-400',
}

interface EventData {
  id: string
  nom: string
  statut: string
  type: string
  dateDebut: string | null
  dateFin: string | null
  lieu: string | null
  client: { raisonSociale: string } | null
}

interface CalendarViewProps {
  evenements: EventData[]
}

export function CalendarView({ evenements }: CalendarViewProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  function getEventsForDay(date: Date) {
    return evenements.filter((ev) => {
      if (!ev.dateDebut) return false
      const evDate = parseISO(ev.dateDebut)
      return isSameDay(evDate, date)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={i}
              className={cn(
                'min-h-[100px] border-b border-r p-1.5',
                !isCurrentMonth && 'bg-gray-50',
                i % 7 === 6 && 'border-r-0'
              )}
            >
              <div className={cn(
                'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                isToday && 'bg-indigo-600 text-white',
                !isToday && isCurrentMonth && 'text-gray-900',
                !isCurrentMonth && 'text-gray-300',
              )}>
                {format(day, 'd')}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => router.push(`/evenements/${ev.id}`)}
                    className={cn(
                      'w-full text-left text-xs px-1.5 py-0.5 rounded text-white truncate hover:opacity-80 transition-opacity',
                      statutColors[ev.statut] || 'bg-gray-400'
                    )}
                    title={`${ev.nom} - ${ev.client?.raisonSociale ?? ''}`}
                  >
                    {ev.nom}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3} autres</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t flex flex-wrap gap-4">
        {Object.entries({
          PROSPECTION: 'Prospection',
          OPTION: 'Option',
          CONFIRME: 'Confirmé',
          EN_COURS: 'En cours',
          REALISE: 'Réalisé',
          ANNULE: 'Annulé',
        }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className={cn('h-2.5 w-2.5 rounded-full', statutColors[key])} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
