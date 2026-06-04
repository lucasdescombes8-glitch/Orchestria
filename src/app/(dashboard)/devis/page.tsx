import { getDevis } from '@/actions/devis'
import { Button } from '@/components/ui/button'
import { StatutDevisBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { differenceInDays } from 'date-fns'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

const STATUTS = ['BROUILLON', 'ENVOYE', 'VU', 'ACCEPTE', 'REFUSE', 'EXPIRE'] as const

interface Props {
  searchParams: Promise<{ statut?: string }>
}

export default async function DevisPage({ searchParams }: Props) {
  const params = await searchParams
  const devis = await getDevis(params.statut ? { statut: params.statut } : undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{devis.length} devis</p>
        </div>
        <Link href="/devis/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/devis">
          <Button variant={!params.statut ? 'default' : 'outline'} size="sm">Tous</Button>
        </Link>
        {STATUTS.map((s) => (
          <Link key={s} href={`/devis?statut=${s}`}>
            <Button variant={params.statut === s ? 'default' : 'outline'} size="sm">
              {s === 'BROUILLON' ? 'Brouillon' :
               s === 'ENVOYE' ? 'Envoyé' :
               s === 'VU' ? 'Vu' :
               s === 'ACCEPTE' ? 'Accepté' :
               s === 'REFUSE' ? 'Refusé' : 'Expiré'}
            </Button>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Entreprise / Événement</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Validité</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Aucun devis</p>
                </TableCell>
              </TableRow>
            ) : (
              devis.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <p className="font-mono text-sm font-medium text-[#C41230]">{d.numero}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {d.evenement?.client?.raisonSociale ?? '—'}
                      </p>
                      {d.evenement && (
                        <p className="text-xs text-gray-400">{d.evenement.nom}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{d.objet ?? '—'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(d.dateEmission)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(d.dateValidite)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(d.totalTtc)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatutDevisBadge statut={d.statut} />
                      {['ENVOYE', 'VU'].includes(d.statut) && d.dateEmission && (
                        <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${differenceInDays(new Date(), new Date(d.dateEmission)) >= 14 ? 'bg-red-100 text-red-700' : differenceInDays(new Date(), new Date(d.dateEmission)) >= 7 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                          <Clock className="h-3 w-3" />
                          {differenceInDays(new Date(), new Date(d.dateEmission))}j
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/devis/${d.id}`}>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
