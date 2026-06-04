import { getTaches } from '@/actions/taches'
import { Button } from '@/components/ui/button'
import { StatutTacheBadge, PrioriteBadge } from '@/components/shared/status-badge'
import { SortableHeader } from '@/components/shared/sortable-header'
import { formatDate } from '@/lib/utils'
import { CheckSquare } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { NewTacheDialog } from './new-tache-dialog'

const PRIORITE_ORDER = { URGENTE: 4, HAUTE: 3, NORMALE: 2, BASSE: 1 }

interface Props {
  searchParams: Promise<{ statut?: string; sort?: string; order?: string }>
}

export default async function TachesPage({ searchParams }: Props) {
  const params = await searchParams
  const sort = params.sort ?? 'dueDate'
  const order = params.order ?? 'asc'

  const taches = await getTaches(params.statut ? { statut: params.statut } : undefined)

  const sorted = [...taches].sort((a, b) => {
    let va: any, vb: any
    if (sort === 'titre') { va = a.titre; vb = b.titre }
    else if (sort === 'dueDate') { va = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; vb = b.dueDate ? new Date(b.dueDate).getTime() : Infinity }
    else if (sort === 'priorite') { va = PRIORITE_ORDER[a.priorite as keyof typeof PRIORITE_ORDER] ?? 0; vb = PRIORITE_ORDER[b.priorite as keyof typeof PRIORITE_ORDER] ?? 0 }
    else if (sort === 'statut') { va = a.statut; vb = b.statut }
    else if (sort === 'evenement') { va = a.evenement?.nom ?? ''; vb = b.evenement?.nom ?? '' }
    else { va = a.dueDate; vb = b.dueDate }
    if (va < vb) return order === 'asc' ? -1 : 1
    if (va > vb) return order === 'asc' ? 1 : -1
    return 0
  })

  const sp = { statut: params.statut, sort: params.sort, order: params.order }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{taches.length} tâche{taches.length > 1 ? 's' : ''}</p>
        </div>
        <NewTacheDialog />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/taches"><Button variant={!params.statut ? 'default' : 'outline'} size="sm">Toutes</Button></Link>
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
              <TableHead><SortableHeader label="Tâche" field="titre" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Priorité" field="priorite" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Échéance" field="dueDate" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Projet" field="evenement" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead>Assigné à</TableHead>
              <TableHead><SortableHeader label="Statut" field="statut" sort={sort} order={order} searchParams={sp} /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-20" /><p>Aucune tâche</p>
                </TableCell>
              </TableRow>
            ) : sorted.map((t) => {
              const isLate = t.dueDate && new Date(t.dueDate) < new Date() && t.statut !== 'TERMINEE'
              return (
                <TableRow key={t.id} className={isLate ? 'bg-red-50/50' : ''}>
                  <TableCell>
                    <p className={`font-medium ${isLate ? 'text-red-700' : 'text-gray-900'}`}>{t.titre}</p>
                    {t.description && <p className="text-xs text-gray-400 truncate max-w-xs">{t.description}</p>}
                  </TableCell>
                  <TableCell><PrioriteBadge priorite={t.priorite} /></TableCell>
                  <TableCell className={`text-sm ${isLate ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{formatDate(t.dueDate)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {t.evenement
                      ? <Link href={`/evenements/${t.evenement.id}`} className="hover:text-[#C41230] transition-colors">{t.evenement.nom}</Link>
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{t.assigne ? `${t.assigne.prenom} ${t.assigne.nom}` : '—'}</TableCell>
                  <TableCell><StatutTacheBadge statut={t.statut} /></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
