'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEvenementStatut } from '@/actions/evenements'
import { StatutEvenementBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

const STATUTS = [
  { key: 'PROSPECTION', label: 'Prospection', color: 'bg-gray-100 border-gray-200' },
  { key: 'OPTION', label: 'Option', color: 'bg-blue-50 border-blue-200' },
  { key: 'CONFIRME', label: 'Confirmé', color: 'bg-green-50 border-green-200' },
  { key: 'EN_COURS', label: 'En cours', color: 'bg-purple-50 border-purple-200' },
  { key: 'REALISE', label: 'Réalisé', color: 'bg-emerald-50 border-emerald-200' },
  { key: 'ANNULE', label: 'Annulé', color: 'bg-red-50 border-red-200' },
]

interface Evenement {
  id: string
  nom: string
  statut: string
  type: string
  dateDebut?: Date | null
  lieu?: string | null
  nombreParticipants?: number | null
  budgetIndicatif?: number | null
  client?: { raisonSociale: string } | null
}

interface KanbanBoardProps {
  evenements: Evenement[]
}

export function KanbanBoard({ evenements }: KanbanBoardProps) {
  const router = useRouter()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [items, setItems] = useState(evenements)

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragging(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, statut: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(statut)
  }

  function handleDragLeave() {
    setDragOver(null)
  }

  async function handleDrop(e: React.DragEvent, statut: string) {
    e.preventDefault()
    setDragOver(null)
    if (!dragging) return

    const item = items.find((i) => i.id === dragging)
    if (!item || item.statut === statut) return

    setItems((prev) =>
      prev.map((i) => (i.id === dragging ? { ...i, statut } : i))
    )

    try {
      await updateEvenementStatut(dragging, statut)
      router.refresh()
    } catch {
      setItems(evenements)
    }
    setDragging(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUTS.map(({ key, label, color }) => {
        const colItems = items.filter((i) => i.statut === key)
        return (
          <div
            key={key}
            className={`flex-shrink-0 w-64 rounded-xl border-2 ${dragOver === key ? 'border-[#C41230] bg-[#FDF2F4]' : color} transition-colors`}
            onDragOver={(e) => handleDragOver(e, key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, key)}
          >
            <div className="p-3 border-b border-current/10">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-700">{label}</span>
                <span className="text-xs bg-white rounded-full px-2 py-0.5 font-medium text-gray-500">
                  {colItems.length}
                </span>
              </div>
            </div>

            <div className="p-2 space-y-2 min-h-[200px]">
              {colItems.map((ev) => (
                <div
                  key={ev.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ev.id)}
                  className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${dragging === ev.id ? 'opacity-50' : ''}`}
                >
                  <Link href={`/evenements/${ev.id}`} onClick={(e) => e.stopPropagation()}>
                    <p className="font-medium text-sm text-gray-900 mb-1 hover:text-[#C41230] transition-colors">
                      {ev.nom}
                    </p>
                  </Link>
                  {ev.client && (
                    <p className="text-xs text-gray-500 mb-2">{ev.client.raisonSociale}</p>
                  )}
                  <div className="space-y-1">
                    {ev.dateDebut && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ev.dateDebut)}
                      </div>
                    )}
                    {ev.lieu && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{ev.lieu}</span>
                      </div>
                    )}
                    {ev.nombreParticipants && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="h-3 w-3" />
                        {ev.nombreParticipants} pers.
                      </div>
                    )}
                  </div>
                  {ev.budgetIndicatif && (
                    <div className="mt-2 text-xs font-medium text-[#C41230]">
                      {formatCurrency(ev.budgetIndicatif)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
