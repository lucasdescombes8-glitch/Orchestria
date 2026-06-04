import { getEvenements } from '@/actions/evenements'
import { KanbanBoard } from '@/components/evenements/kanban-board'
import { Button } from '@/components/ui/button'
import { StatutEvenementBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, LayoutGrid, List, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

interface Props {
  searchParams: Promise<{ view?: string; statut?: string }>
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
  const evenements = await getEvenements(params.statut ? { statut: params.statut } : undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Événements<span className="text-[#C41230]"> /</span></h1>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Statut</TableHead>
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
                      {ev.lieu ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ev.lieu}
                        </span>
                      ) : '—'}
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
