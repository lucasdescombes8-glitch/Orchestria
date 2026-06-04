'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateEvenementStatut, updateEvenement, getEvenements } from '@/actions/evenements'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users, X, Save, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const STATUTS = [
  { key: 'PROSPECTION', label: 'Opportunité', color: 'bg-gray-100 border-gray-200' },
  { key: 'OPTION', label: 'Option', color: 'bg-blue-50 border-blue-200' },
  { key: 'CONFIRME', label: 'Confirmé', color: 'bg-green-50 border-green-200' },
  { key: 'REALISE', label: 'Facturation', color: 'bg-emerald-50 border-emerald-200' },
]

const TYPE_OPTIONS = [
  { value: 'CONFERENCE', label: 'Conférence' },
  { value: 'SEMINAIRE', label: 'Séminaire' },
  { value: 'GALA', label: 'Gala' },
  { value: 'TEAMBUILDING', label: 'Team Building' },
  { value: 'MARIAGE', label: 'Mariage' },
  { value: 'CONGRES', label: 'Congrès' },
  { value: 'SALON', label: 'Salon' },
  { value: 'AUTRE', label: 'Autre' },
]

interface Evenement {
  id: string
  nom: string
  statut: string
  type: string
  dateDebut?: Date | null
  dateFin?: Date | null
  heureDebutMontage?: string | null
  heureDebutEvenement?: string | null
  heureFinEvenement?: string | null
  heureFinDemontage?: string | null
  salles?: string | null
  lieu?: string | null
  nombreParticipants?: number | null
  budgetIndicatif?: number | null
  brief?: string | null
  notes?: string | null
  probabilite?: number | null
  client?: { id?: string; raisonSociale: string } | null
}

interface KanbanBoardProps {
  evenements: Evenement[]
}

function toDateInput(d?: Date | null): string {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toISOString().slice(0, 10)
}

function EditModal({ ev, onClose, onSaved }: {
  ev: Evenement
  onClose: () => void
  onSaved: (updated: Partial<Evenement>) => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nom: ev.nom,
    type: ev.type,
    statut: ev.statut,
    dateDebut: toDateInput(ev.dateDebut),
    dateFin: toDateInput(ev.dateFin),
    heureDebutMontage: ev.heureDebutMontage ?? '',
    heureDebutEvenement: ev.heureDebutEvenement ?? '',
    heureFinEvenement: ev.heureFinEvenement ?? '',
    heureFinDemontage: ev.heureFinDemontage ?? '',
    salles: ev.salles ?? '',
    lieu: ev.lieu ?? '',
    nombreParticipants: ev.nombreParticipants?.toString() ?? '',
    budgetIndicatif: ev.budgetIndicatif?.toString() ?? '',
    brief: ev.brief ?? '',
    notes: ev.notes ?? '',
    probabilite: ev.probabilite?.toString() ?? '50',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateEvenement(ev.id, {
        nom: form.nom,
        type: form.type,
        statut: form.statut,
        dateDebut: form.dateDebut || null,
        dateFin: form.dateFin || null,
        heureDebutMontage: form.heureDebutMontage || undefined,
        heureDebutEvenement: form.heureDebutEvenement || undefined,
        heureFinEvenement: form.heureFinEvenement || undefined,
        heureFinDemontage: form.heureFinDemontage || undefined,
        salles: form.salles || undefined,
        lieu: form.lieu || undefined,
        nombreParticipants: form.nombreParticipants ? Number(form.nombreParticipants) : undefined,
        budgetIndicatif: form.budgetIndicatif ? Number(form.budgetIndicatif) : undefined,
        brief: form.brief || undefined,
        notes: form.notes || undefined,
        probabilite: form.probabilite ? Number(form.probabilite) : undefined,
      })
      onSaved({
        nom: form.nom,
        statut: form.statut,
        type: form.type,
        dateDebut: form.dateDebut ? new Date(form.dateDebut) : null,
        dateFin: form.dateFin ? new Date(form.dateFin) : null,
        lieu: form.lieu || null,
        nombreParticipants: form.nombreParticipants ? Number(form.nombreParticipants) : null,
        budgetIndicatif: form.budgetIndicatif ? Number(form.budgetIndicatif) : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Modifier le projet</h2>
            <Link
              href={`/evenements/${ev.id}`}
              className="flex items-center gap-1 text-xs text-[#C41230] hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Fiche complète
            </Link>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1">
            <Label>Nom du projet *</Label>
            <Input value={form.nom} onChange={(e) => set('nom', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Statut</Label>
              <select
                value={form.statut}
                onChange={(e) => set('statut', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
              >
                {STATUTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date de début</Label>
              <Input type="date" value={form.dateDebut} onChange={(e) => set('dateDebut', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Date de fin</Label>
              <Input type="date" value={form.dateFin} onChange={(e) => set('dateFin', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Salle(s)</Label>
            <div className="border border-gray-200 rounded-lg p-3 grid grid-cols-2 gap-1.5">
              {['Corbeille', 'Agents de change', 'Allée Rhône', 'Allée Saône', 'Lumière', 'Ampère', 'Tony Garnier', 'Jacquard', 'Coursives 1er étage'].map((salle) => {
                const selected = form.salles.split(',').map((s) => s.trim()).filter(Boolean)
                return (
                  <label key={salle} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(salle)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selected, salle]
                          : selected.filter((s) => s !== salle)
                        set('salles', next.join(','))
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-700">{salle}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Début montage</Label>
              <Input type="time" value={form.heureDebutMontage} onChange={(e) => set('heureDebutMontage', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Début événement</Label>
              <Input type="time" value={form.heureDebutEvenement} onChange={(e) => set('heureDebutEvenement', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Fin événement</Label>
              <Input type="time" value={form.heureFinEvenement} onChange={(e) => set('heureFinEvenement', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Fin démontage</Label>
              <Input type="time" value={form.heureFinDemontage} onChange={(e) => set('heureFinDemontage', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Participants</Label>
              <Input type="number" value={form.nombreParticipants} onChange={(e) => set('nombreParticipants', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label>Budget (€)</Label>
              <Input type="number" value={form.budgetIndicatif} onChange={(e) => set('budgetIndicatif', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label>Probabilité (%)</Label>
              <Input type="number" min="0" max="100" value={form.probabilite} onChange={(e) => set('probabilite', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Brief</Label>
            <Textarea value={form.brief} onChange={(e) => set('brief', e.target.value)} rows={2} placeholder="Description du projet..." />
          </div>

          <div className="space-y-1">
            <Label>Notes internes</Label>
            <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Notes..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.nom}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function KanbanBoard({ evenements }: KanbanBoardProps) {
  const router = useRouter()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [items, setItems] = useState(evenements)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingEv = editingId ? items.find((i) => i.id === editingId) : null

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

  function handleSaved(id: string, updated: Partial<Evenement>) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
    )
    router.refresh()
  }

  return (
    <>
      {editingEv && (
        <EditModal
          ev={editingEv}
          onClose={() => setEditingId(null)}
          onSaved={(updated) => handleSaved(editingEv.id, updated)}
        />
      )}

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
                    onClick={() => setEditingId(ev.id)}
                    className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#C41230]/30 transition-all ${dragging === ev.id ? 'opacity-50' : ''}`}
                  >
                    <p className="font-medium text-sm text-gray-900 mb-1 hover:text-[#C41230] transition-colors">
                      {ev.nom}
                    </p>
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
    </>
  )
}
