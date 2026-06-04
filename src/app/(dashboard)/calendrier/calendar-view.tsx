'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parseISO, getHours, getMinutes, getDaysInMonth, isWeekend, getDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Resource configuration ──────────────────────────────────────────────────

const RESOURCES = [
  { category: 'Lyon', rooms: ['Evènements'] },
  { category: 'RDC', rooms: ['Corbeille', 'Agents de Change', 'Allée Rhône'] },
  { category: '1er Étage', rooms: ['Lumière', 'Ampère', 'Tony Garnier', 'Jacquard'] },
  { category: 'Travaux / Livraison', rooms: ['Travaux/intervention', '20 Rue de la Bourse', 'Place des Cordeliers'] },
  { category: 'Lyon', rooms: ['Grands Évènements'] },
]

const MONTHS = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const STATUT_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  PROSPECTION: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  OPTION:      { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-500' },
  CONFIRME:    { bg: 'bg-red-50',   text: 'text-[#C41230]', dot: 'bg-[#C41230]' },
  EN_COURS:    { bg: 'bg-purple-50',text: 'text-purple-700',dot: 'bg-purple-500' },
  REALISE:     { bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500' },
  ANNULE:      { bg: 'bg-orange-50',text: 'text-orange-700',dot: 'bg-orange-400' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): Date[] {
  const count = getDaysInMonth(new Date(year, month, 1))
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))
}

function eventHourSpan(ev: EventData, day: Date) {
  if (!ev.dateDebut) return null
  const start = parseISO(ev.dateDebut)
  const end = ev.dateFin ? parseISO(ev.dateFin) : start
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)
  const dayEnd   = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)
  if (start > dayEnd || end < dayStart) return null
  const effectiveStart = start < dayStart ? dayStart : start
  const effectiveEnd   = end > dayEnd ? dayEnd : end
  const startHour = getHours(effectiveStart) + getMinutes(effectiveStart) / 60
  const endHour   = getHours(effectiveEnd)   + getMinutes(effectiveEnd)   / 60 + (end > dayEnd ? 1 : 0)
  return { startHour: Math.floor(startHour), spanHours: Math.max(1, Math.ceil(endHour - startHour)) }
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarView({ evenements }: { evenements: EventData[] }) {
  const router = useRouter()
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const days = useMemo(() => daysInMonth(year, month), [year, month])

  // Flat rows list for the table
  const rows = useMemo(() => {
    const result: { category: string; categorySpan: number; showCategory: boolean; room: string }[] = []
    for (const res of RESOURCES) {
      res.rooms.forEach((room, i) => {
        result.push({ category: res.category, categorySpan: res.rooms.length, showCategory: i === 0, room })
      })
    }
    return result
  }, [])

  const getEventsForDayRoom = useCallback((day: Date, room: string): EventData[] => {
    return evenements.filter((ev) => {
      if (!ev.dateDebut) return false
      const d = parseISO(ev.dateDebut)
      if (d.getFullYear() !== day.getFullYear() || d.getMonth() !== day.getMonth() || d.getDate() !== day.getDate()) return false
      const lieu = (ev.lieu ?? '').toLowerCase()
      const r = room.toLowerCase()
      return lieu.includes(r) || r.includes(lieu)
    })
  }, [evenements])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDayDoubleClick(day: Date) {
    router.push(`/evenements/nouveau?date=${isoDate(day)}`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Navigation ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Year + prev/next */}
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900 capitalize">{MONTHS[month]}</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center font-medium focus:outline-none focus:border-[#C41230]"
              />
            </div>
            <button onClick={nextMonth} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Month buttons */}
          <div className="flex flex-wrap gap-1.5">
            {MONTHS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMonth(i)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                  month === i
                    ? 'bg-[#C41230] text-white shadow-sm shadow-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1">
                <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                {key === 'PROSPECTION' ? 'Prospection' : key === 'OPTION' ? 'Option' : key === 'CONFIRME' ? 'Confirmé' : key === 'EN_COURS' ? 'En cours' : key === 'REALISE' ? 'Réalisé' : 'Annulé'}
              </span>
            ))}
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-gray-100 text-center leading-4 text-gray-500 font-mono text-[10px]">2×</span>
          Double-clic sur un jour pour créer un projet
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs w-full" style={{ minWidth: '1600px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="border-r border-gray-200 px-3 py-3 text-left font-semibold text-gray-600 whitespace-nowrap sticky left-0 bg-gray-50 z-20" style={{ minWidth: 76 }}>
                  <span className="capitalize">{MONTHS[month]} {year}</span>
                </th>
                <th className="border-r border-gray-200 px-3 py-3 text-left font-semibold text-gray-500" style={{ minWidth: 110 }} />
                <th className="border-r border-gray-200 px-3 py-3 text-left font-semibold text-gray-500" style={{ minWidth: 140 }} />
                {HOURS.map((h) => (
                  <th key={h} className="border-r border-gray-200 px-0 py-3 text-center font-medium text-gray-400 whitespace-nowrap" style={{ minWidth: 52, width: 52 }}>
                    <span className={cn(h >= 8 && h <= 22 ? 'text-gray-600' : 'text-gray-300')}>
                      {String(h).padStart(2, '0')}h
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const weekend = isWeekend(day)
                const todayDay = isToday(day)
                const dayBg = weekend ? 'bg-gray-50/80' : 'bg-white'

                return rows.map((row, rowIdx) => (
                  <tr
                    key={`${day.toISOString()}-${rowIdx}`}
                    className={cn('border-b border-gray-100 last:border-0', dayBg)}
                  >
                    {/* Day label */}
                    {rowIdx === 0 && (
                      <td
                        rowSpan={rows.length}
                        onDoubleClick={() => handleDayDoubleClick(day)}
                        className={cn(
                          'border-r border-gray-200 px-2 py-1 font-medium whitespace-nowrap align-middle text-center cursor-pointer select-none sticky left-0 z-10 transition-colors',
                          dayBg,
                          todayDay
                            ? 'bg-[#FDF2F4]'
                            : weekend ? 'bg-gray-50' : 'bg-white',
                          'hover:bg-[#FDF2F4] group'
                        )}
                        style={{ minWidth: 76 }}
                        title="Double-clic pour créer un projet"
                      >
                        <div className={cn(
                          'flex flex-col items-center gap-0.5',
                          todayDay ? 'text-[#C41230]' : weekend ? 'text-gray-400' : 'text-gray-700'
                        )}>
                          <span className="text-[10px] uppercase tracking-wide">{DAYS_FR[getDay(day)]}</span>
                          <span className={cn(
                            'text-sm font-bold leading-none h-6 w-6 flex items-center justify-center rounded-full',
                            todayDay && 'bg-[#C41230] text-white'
                          )}>
                            {day.getDate()}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Category label */}
                    {row.showCategory && (
                      <td
                        rowSpan={row.categorySpan}
                        className={cn(
                          'border-r border-gray-200 px-3 py-1 font-semibold text-gray-600 align-middle whitespace-nowrap text-xs',
                          weekend ? 'bg-gray-50/80' : 'bg-gray-50/50'
                        )}
                        style={{ minWidth: 110 }}
                      >
                        {row.category}
                      </td>
                    )}

                    {/* Room name */}
                    <td className="border-r border-gray-200 px-3 py-1 text-gray-500 whitespace-nowrap" style={{ minWidth: 140 }}>
                      {row.room}
                    </td>

                    {/* Hour cells */}
                    {HOURS.map((h) => {
                      const eventsHere = getEventsForDayRoom(day, row.room).filter((ev) => {
                        const span = eventHourSpan(ev, day)
                        return span && span.startHour === h
                      })
                      const isNight = h < 7 || h > 22

                      return (
                        <td
                          key={h}
                          onDoubleClick={() => handleDayDoubleClick(day)}
                          className={cn(
                            'border-r border-gray-100 px-0 align-middle relative cursor-pointer',
                            isNight ? 'bg-gray-50/60' : '',
                            dayBg
                          )}
                          style={{ height: 28, width: 52, minWidth: 52 }}
                        >
                          {eventsHere.map((ev) => {
                            const span = eventHourSpan(ev, day)
                            if (!span) return null
                            const cfg = STATUT_CONFIG[ev.statut] ?? STATUT_CONFIG.OPTION
                            return (
                              <div
                                key={ev.id}
                                title={`${ev.nom}${ev.client ? ` — ${ev.client.raisonSociale}` : ''}`}
                                onClick={(e) => { e.stopPropagation(); router.push(`/evenements/${ev.id}`) }}
                                className={cn(
                                  'absolute inset-y-0.5 flex items-center px-1.5 rounded-md text-[10px] font-medium truncate z-10 cursor-pointer shadow-sm border border-white/60 transition-opacity hover:opacity-80',
                                  cfg.bg, cfg.text
                                )}
                                style={{ left: 1, width: `calc(${span.spanHours * 100}% - 2px)` }}
                              >
                                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0 mr-1', cfg.dot)} />
                                {ev.nom}
                              </div>
                            )
                          })}
                        </td>
                      )
                    })}
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
