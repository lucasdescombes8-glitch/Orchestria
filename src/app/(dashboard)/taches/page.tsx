import { getTaches } from '@/actions/taches'
import { Button } from '@/components/ui/button'
import { StatutTacheBadge, PrioriteBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'
import { CheckSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { NewTacheDialog } from './new-tache-dialog'

interface Props {
  searchParams: Promise<{ statut?: string }>
}

export default async function TachesPage({ searchParams }: Props) {
  const params = await searchParams
  const taches = await getTaches(params.statut ? { statut: params.statut } : undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{taches.length} tâche(s)</p>
        </div>
        <NewTacheDialog />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/taches">
          <Button variant={!params.statut ? 'default' : 'outline'} size="sm">Toutes</Button>
        </Link>
        {(['A_FAIRE', 'EN_COURS', 'TERMINEE'] as const).map((s) => (
          <Link key={s} href={`/taches?statut=${s}`}>
            <Button variant={params.statut === s ? 'default' : 'outline'} size="sm">
              {s === 'A_FAIRE' ? 'À faire' : s === 'EN_COURS' ? 'En cours' : 'Terminées'}
            </Button>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tâche</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Assigné à</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Aucune tâche</p>
                </TableCell>
              </TableRow>
            ) : (
              taches.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{t.titre}</p>
                      {t.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{t.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><PrioriteBadge priorite={t.priorite} /></TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(t.dueDate)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {t.evenement ? (
                      <Link href={`/evenements/${t.evenement.id}`} className="hover:text-[#C41230]">
                        {t.evenement.nom}
                      </Link>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {t.assigne ? `${t.assigne.prenom} ${t.assigne.nom}` : '—'}
                  </TableCell>
                  <TableCell><StatutTacheBadge statut={t.statut} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
