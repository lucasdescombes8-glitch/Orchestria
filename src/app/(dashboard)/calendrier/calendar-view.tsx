'use client'

import { useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { parseISO, getHours, getMinutes, getDaysInMonth, isWeekend, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
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

interface CalendarViewProps {
  evenements: EventData[]
}

// ─── Resource configuration ──────────────────────────────────────────────────

interface Room {
  name: string
}

interface Category {
  name: string
  rooms: Room[]
}

const RESOURCES: Category[] = [
  {
    name: 'Lyon',
    rooms: [{ name: 'Evènements' }],
  },
  {
    name: 'RDC',
    rooms: [
      { name: 'Corbeille' },
      { name: 'Agents de Change' },
      { name: 'Allee Rhone' },
    ],
  },
  {
    name: '1er Etage',
    rooms: [
      { name: 'Lumière' },
      { name: 'Ampère' },
      { name: 'Tony Garnier' },
      { name: 'Jacquard' },
    ],
  },
  {
    name: 'TRAVAUX / LIVRAISON',
    rooms: [
      { name: 'Travaux/intervention' },
      { name: '20 Rue de la Bourse' },
      { name: 'Place des Cordeliers' },
    ],
  },
  {
    name: 'Lyon',
    rooms: [{ name: 'Grands Evènements' }],
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  { label: 'Janv.', value: 0 },
  { label: 'Fév.', value: 1 },
  { label: 'Mars', value: 2 },
  { label: 'Avril', value: 3 },
  { label: 'Mai', value: 4 },
  { label: 'Juin', value: 5 },
  { label: 'Juil.', value: 6 },
  { label: 'Août', value: 7 },
  { label: 'Sept.', value: 8 },
  { label: 'Oct.', value: 9 },
  { label: 'Nov.', value: 10 },
  { label: 'Déc.', value: 11 },
]

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const DAY_LABELS_FR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

const STATUT_COLORS: Record<string, string> = {
  PROSPECTION: 'bg-gray-400 text-white',
  OPTION: 'bg-blue-500 text-white',
  CONFIRME: 'bg-[#C41230] text-white',
  EN_COURS: 'bg-purple-500 text-white',
  REALISE: 'bg-emerald-500 text-white',
  ANNULE: 'bg-red-400 text-white',
}

// Only these statuses appear in the Projets section of the calendar
const CALENDAR_STATUTS = ['OPTION', 'CONFIRME']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): Date[] {
  const count = getDaysInMonth(new Date(year, month, 1))
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))
}

function dayLabel(date: Date): string {
  const dow = DAY_LABELS_FR[getDay(date)]
  const d = date.getDate().toString().padStart(2, '0')
  return `${dow} ${d}`
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

// Returns start hour (0-23) and span (in hours) for an event on a given day
function eventHourSpan(
  ev: EventData,
  day: Date
): { startHour: number; spanHours: number } | null {
  if (!ev.dateDebut) return null
  const start = parseISO(ev.dateDebut)
  const end = ev.dateFin ? parseISO(ev.dateFin) : start

  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

  if (start > dayEnd || end < dayStart) return null

  const effectiveStart = start < dayStart ? dayStart : start
  const effectiveEnd = end > dayEnd ? dayEnd : end

  const startHour = getHours(effectiveStart) + getMinutes(effectiveStart) / 60
  const endHour = getHours(effectiveEnd) + getMinutes(effectiveEnd) / 60 + (end > dayEnd ? 1 : 0)
  const spanHours = Math.max(1, endHour - startHour)

  return { startHour: Math.floor(startHour), spanHours: Math.ceil(spanHours) }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarView({ evenements }: CalendarViewProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [viewAll, setViewAll] = useState(false)

  const days = useMemo(() => daysInMonth(year, month), [year, month])

  // Build flat list of rows: { categoryIndex, categoryName, categoryRowspan, roomName }
  const rows = useMemo(() => {
    const result: {
      categoryName: string
      categoryRowspan: number
      showCategory: boolean
      roomName: string
    }[] = []
    for (const cat of RESOURCES) {
      cat.rooms.forEach((room, i) => {
        result.push({
          categoryName: cat.name,
          categoryRowspan: cat.rooms.length,
          showCategory: i === 0,
          roomName: room.name,
        })
      })
    }
    return result
  }, [])

  // Index events by day+room for quick lookup
  const eventIndex = useMemo(() => {
    const idx: Record<string, EventData[]> = {}
    for (const ev of evenements) {
      if (!ev.dateDebut) continue
      const d = parseISO(ev.dateDebut)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${ev.lieu ?? ''}`
      if (!idx[key]) idx[key] = []
      idx[key].push(ev)
    }
    return idx
  }, [evenements])

  function getEventsForDayRoom(day: Date, roomName: string): EventData[] {
    return evenements.filter((ev) => {
      if (!ev.dateDebut) return false
      const d = parseISO(ev.dateDebut)
      if (
        d.getFullYear() !== day.getFullYear() ||
        d.getMonth() !== day.getMonth() ||
        d.getDate() !== day.getDate()
      )
        return false
      return (ev.lieu ?? '').toLowerCase().includes(roomName.toLowerCase()) ||
        roomName.toLowerCase().includes((ev.lieu ?? '').toLowerCase())
    })
  }

  return (
    <div className="flex flex-col gap-0 text-sm">
      {/* ── Top navigation bar ── */}
      <div className="flex items-center gap-2 flex-wrap bg-slate-100 border border-slate-300 rounded-t px-3 py-2">
        <span className="text-xs font-semibold text-slate-600 mr-2">Navigation</span>

        {/* Year input */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Année</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white"
          />
        </div>

        {/* Month buttons */}
        <div className="flex flex-wrap gap-1">
          {MONTHS.map((m) => (
            <button
              key={m.value}
              onClick={() => { setMonth(m.value); setViewAll(false) }}
              className={cn(
                'px-2 py-0.5 rounded text-xs border',
                !viewAll && month === m.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              )}
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={() => setViewAll(true)}
            className={cn(
              'px-2 py-0.5 rounded text-xs border',
              viewAll
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            )}
          >
            Année Entière
          </button>
        </div>
      </div>

      {/* ── Action toolbar ── */}
      <div className="flex items-center gap-1 flex-wrap bg-slate-50 border-b border-x border-slate-200 px-3 py-1.5">
        {['Poser', 'Ouvrir', 'Dupliquer', 'Supprimer', 'Confirmer', 'Annuler', 'Réaliser', 'Participant', 'Dossier', 'Action'].map((label) => (
          <button
            key={label}
            className="px-2 py-0.5 rounded text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button className="px-2 py-0.5 rounded text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700">
          Indiv
        </button>
        <button className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600">
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {/* ── Planning label ── */}
      <div className="border-x border-slate-200 px-3 py-1">
        <span className="text-blue-600 font-semibold text-sm">Planning</span>
      </div>

      {/* ── Planning grid ── */}
      <div className="border border-slate-300 rounded-b overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: '1400px' }}>
          {/* Header row: labels + hour columns */}
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-1 py-1 text-left font-medium text-slate-600 whitespace-nowrap" style={{ minWidth: 72 }}>
                {monthLabel(year, month)}
              </th>
              <th className="border border-slate-300 px-1 py-1 text-left font-medium text-slate-500" style={{ minWidth: 80 }}>
              </th>
              <th className="border border-slate-300 px-1 py-1 text-left font-medium text-slate-500" style={{ minWidth: 120 }}>
              </th>
              {HOURS.map((h) => (
                <th
                  key={h}
                  className="border border-slate-300 px-0 py-1 text-center font-medium text-slate-600 whitespace-nowrap"
                  style={{ minWidth: 52 }}
                >
                  {String(h).padStart(2, '0')}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ── Projets section: Option (blue) + Confirmé (red) ── */}
            {days.map((day) => {
              const weekend = isWeekend(day)
              const rowBg = weekend ? 'bg-gray-200' : 'bg-white'
              const label = dayLabel(day)
              const projetsRows = [
                { statut: 'OPTION', label: 'Option' },
                { statut: 'CONFIRME', label: 'Confirmé' },
              ]

              return projetsRows.map((pr, prIdx) => {
                const eventsForDay = evenements.filter((ev) => {
                  if (ev.statut !== pr.statut || !ev.dateDebut) return false
                  const start = parseISO(ev.dateDebut)
                  const end = ev.dateFin ? parseISO(ev.dateFin) : start
                  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
                  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
                  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
                  return d >= s && d <= e
                })

                return (
                  <tr key={`proj-${day.toISOString()}-${pr.statut}`} className={rowBg}>
                    {prIdx === 0 && (
                      <td rowSpan={2} className={`border border-slate-300 px-1 py-0.5 font-medium text-slate-700 whitespace-nowrap align-top ${rowBg}`}>
                        {label}
                      </td>
                    )}
                    {prIdx === 0 && (
                      <td rowSpan={2} className="border border-slate-300 px-1 py-0.5 bg-slate-50 font-semibold text-slate-600 align-top whitespace-nowrap text-xs">
                        Projets
                      </td>
                    )}
                    <td className="border border-slate-300 px-1 py-0.5 text-slate-500 whitespace-nowrap text-xs">
                      {pr.label}
                    </td>
                    {HOURS.map((h) => {
                      const evHere = eventsForDay.filter((ev) => {
                        const span = eventHourSpan(ev, day)
                        return span && span.startHour === h
                      })
                      return (
                        <td key={h} className={`border border-slate-300 px-0 py-0.5 relative ${rowBg}`} style={{ height: 24 }}>
                          {evHere.map((ev) => {
                            const span = eventHourSpan(ev, day)
                            if (!span) return null
                            return (
                              <div
                                key={ev.id}
                                title={`${ev.nom} — ${ev.client?.raisonSociale ?? ''}`}
                                className={`absolute inset-y-0 flex items-center px-1 rounded text-xs truncate z-10 opacity-90 ${STATUT_COLORS[ev.statut] || 'bg-blue-400 text-white'}`}
                                style={{ left: 0, width: `${span.spanHours * 100}%` }}
                              >
                                {ev.nom}
                              </div>
                            )
                          })}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            })}

            {/* ── Room rows ── */}
            {days.map((day) => {
              const weekend = isWeekend(day)
              const rowBg = weekend ? 'bg-gray-200' : 'bg-white'
              const label = dayLabel(day)

              return rows.map((row, rowIdx) => (
                <tr key={`${day.toISOString()}-${rowIdx}`} className={rowBg}>
                  {/* Day label cell — only show for first resource row */}
                  {rowIdx === 0 && (
                    <td
                      rowSpan={rows.length}
                      className={cn(
                        'border border-slate-300 px-1 py-0.5 font-medium text-slate-700 whitespace-nowrap align-top',
                        rowBg
                      )}
                    >
                      {label}
                    </td>
                  )}

                  {/* Category label — only show for first room of category */}
                  {row.showCategory && (
                    <td
                      rowSpan={row.categoryRowspan}
                      className="border border-slate-300 px-1 py-0.5 bg-slate-50 font-medium text-slate-600 align-top whitespace-nowrap"
                    >
                      {row.categoryName}
                    </td>
                  )}

                  {/* Room name */}
                  <td className="border border-slate-300 px-1 py-0.5 text-slate-600 whitespace-nowrap">
                    {row.roomName}
                  </td>

                  {/* Hour cells */}
                  {HOURS.map((h) => {
                    const eventsHere = getEventsForDayRoom(day, row.roomName).filter((ev) => {
                      const span = eventHourSpan(ev, day)
                      return span && span.startHour === h
                    })

                    return (
                      <td
                        key={h}
                        className={cn(
                          'border border-slate-300 px-0 py-0.5 align-middle relative',
                          rowBg
                        )}
                        style={{ height: 24 }}
                      >
                        {eventsHere.map((ev) => {
                          const span = eventHourSpan(ev, day)
                          if (!span) return null
                          const colorClass = STATUT_COLORS[ev.statut] || 'bg-blue-400 text-white'
                          return (
                            <div
                              key={ev.id}
                              title={`${ev.nom} — ${ev.client?.raisonSociale ?? ''}`}
                              className={cn(
                                'absolute inset-y-0 flex items-center px-1 rounded text-xs truncate z-10 opacity-90',
                                colorClass
                              )}
                              style={{
                                left: 0,
                                width: `${span.spanHours * 100}%`,
                              }}
                            >
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
  )
}
