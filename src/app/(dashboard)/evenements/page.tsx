import { getEvenements } from '@/actions/evenements'
import { KanbanBoard } from '@/components/evenements/kanban-board'
import { Button } from '@/components/ui/button'
import { StatutEvenementBadge } from '@/components/shared/status-badge'
import { SortableHeader } from '@/components/shared/sortable-header'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, LayoutGrid, List, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

interface Props {
  searchParams: Promise<{ view?: string; statut?: string; sort?: string; order?: string }>
}

const typeLabels: Record<string, string> = {
  CONFERENCE: 'Conférence',
  SEMINAIRE: 'Séminaire',
  GALA: 'Gala',
  TEAMBUILDING: 'Team Building',
  MARIAGE: 'Mariage',
  CONGRES: 'Congrès',
  SALON: 'Salon',
  AUTRE: 'Autre',
}

export default async function EvenementsPage({ searchParams }: Props) {
  const params = await searchParams
  const view = params.view || 'kanban'
  const sort = params.sort ?? 'dateDebut'
  const order = params.order ?? 'desc'
  const allEvenements = await getEvenements(params.statut ? { statut: params.statut } : undefined)

  const evenements = [...allEvenements].sort((a, b) => {
    let va: any, vb: any
    if (sort === 'nom') { va = a.nom; vb = b.nom }
    else if (sort === 'dateDebut') { va = a.dateDebut ? new Date(a.dateDebut).getTime() : 0; vb = b.dateDebut ? new Date(b.dateDebut).getTime() : 0 }
    else if (sort === 'budgetIndicatif') { va = a.budgetIndicatif ?? 0; vb = b.budgetIndicatif ?? 0 }
    else if (sort === 'statut') { va = a.statut; vb = b.statut }
    else if (sort === 'client') { va = a.client?.raisonSociale ?? ''; vb = b.client?.raisonSociale ?? '' }
    else { va = a.dateDebut; vb = b.dateDebut }
    if (va < vb) return order === 'asc' ? -1 : 1
    if (va > vb) return order === 'asc' ? 1 : -1
    return 0
  })

  const sp = { view: params.view, statut: params.statut, sort: params.sort, order: params.order }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{evenements.length} événement(s)</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Link href="?view=kanban">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
            </Link>
            <Link href="?view=list">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
                Liste
              </button>
            </Link>
          </div>
          <Link href="/evenements/nouveau">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </Link>
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanBoard evenements={evenements} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortableHeader label="Projet" field="nom" sort={sort} order={order} searchParams={sp} /></TableHead>
                <TableHead><SortableHeader label="Entreprise" field="client" sort={sort} order={order} searchParams={sp} /></TableHead>
                <TableHead><SortableHeader label="Date" field="dateDebut" sort={sort} order={order} searchParams={sp} /></TableHead>
                <TableHead>Salles</TableHead>
                <TableHead>Type</TableHead>
                <TableHead><SortableHeader label="Budget" field="budgetIndicatif" sort={sort} order={order} searchParams={sp} /></TableHead>
                <TableHead><SortableHeader label="Statut" field="statut" sort={sort} order={order} searchParams={sp} /></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evenements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>Aucun événement</p>
                  </TableCell>
                </TableRow>
              ) : (
                evenements.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{ev.nom}</p>
                        {ev.nombreParticipants && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ev.nombreParticipants} pers.
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {ev.client?.raisonSociale ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(ev.dateDebut)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {(ev as any).salles ? (ev as any).salles.split(',').map((s: string) => s.trim()).join(', ') : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {typeLabels[ev.type] ?? ev.type}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ev.budgetIndicatif ? formatCurrency(ev.budgetIndicatif) : '—'}
                    </TableCell>
                    <TableCell>
                      <StatutEvenementBadge statut={ev.statut} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/evenements/${ev.id}`}>
                        <Button variant="ghost" size="sm">Voir</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
