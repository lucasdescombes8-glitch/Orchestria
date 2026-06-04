import { getDevis } from '@/actions/devis'
import { Button } from '@/components/ui/button'
import { StatutDevisBadge } from '@/components/shared/status-badge'
import { SortableHeader } from '@/components/shared/sortable-header'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { differenceInDays } from 'date-fns'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

const STATUTS = ['BROUILLON', 'ENVOYE', 'VU', 'ACCEPTE', 'REFUSE', 'EXPIRE'] as const
const STATUT_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon', ENVOYE: 'Envoyé', VU: 'Vu',
  ACCEPTE: 'Accepté', REFUSE: 'Refusé', EXPIRE: 'Expiré',
}

interface Props {
  searchParams: Promise<{ statut?: string; sort?: string; order?: string }>
}

export default async function DevisPage({ searchParams }: Props) {
  const params = await searchParams
  const sort = params.sort ?? 'dateEmission'
  const order = params.order ?? 'desc'

  const devis = await getDevis(params.statut ? { statut: params.statut } : undefined)

  const sorted = [...devis].sort((a, b) => {
    let va: any, vb: any
    if (sort === 'numero') { va = a.numero; vb = b.numero }
    else if (sort === 'dateEmission') { va = a.dateEmission ? new Date(a.dateEmission).getTime() : 0; vb = b.dateEmission ? new Date(b.dateEmission).getTime() : 0 }
    else if (sort === 'dateValidite') { va = a.dateValidite ? new Date(a.dateValidite).getTime() : 0; vb = b.dateValidite ? new Date(b.dateValidite).getTime() : 0 }
    else if (sort === 'totalTtc') { va = a.totalTtc; vb = b.totalTtc }
    else if (sort === 'statut') { va = a.statut; vb = b.statut }
    else if (sort === 'client') { va = a.evenement?.client?.raisonSociale ?? ''; vb = b.evenement?.client?.raisonSociale ?? '' }
    else { va = a.dateEmission; vb = b.dateEmission }
    if (va < vb) return order === 'asc' ? -1 : 1
    if (va > vb) return order === 'asc' ? 1 : -1
    return 0
  })

  const sp = { statut: params.statut, sort: params.sort, order: params.order }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{devis.length} devis</p>
        </div>
        <Link href="/devis/nouveau"><Button><Plus className="h-4 w-4 mr-2" />Nouveau devis</Button></Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/devis"><Button variant={!params.statut ? 'default' : 'outline'} size="sm">Tous</Button></Link>
        {STATUTS.map((s) => (
          <Link key={s} href={`/devis?statut=${s}`}>
            <Button variant={params.statut === s ? 'default' : 'outline'} size="sm">{STATUT_LABELS[s]}</Button>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortableHeader label="Numéro" field="numero" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Entreprise" field="client" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead>Objet</TableHead>
              <TableHead><SortableHeader label="Date" field="dateEmission" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Validité" field="dateValidite" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead className="text-right"><SortableHeader label="Total TTC" field="totalTtc" sort={sort} order={order} searchParams={sp} className="justify-end" /></TableHead>
              <TableHead><SortableHeader label="Statut" field="statut" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Aucun devis</p>
                </TableCell>
              </TableRow>
            ) : sorted.map((d) => (
              <TableRow key={d.id}>
                <TableCell><p className="font-mono text-sm font-semibold text-[#C41230]">{d.numero}</p></TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-gray-900">{d.evenement?.client?.raisonSociale ?? '—'}</p>
                  {d.evenement && <p className="text-xs text-gray-400">{d.evenement.nom}</p>}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{d.objet ?? '—'}</TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(d.dateEmission)}</TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(d.dateValidite)}</TableCell>
                <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(d.totalTtc)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatutDevisBadge statut={d.statut} />
                    {['ENVOYE', 'VU'].includes(d.statut) && d.dateEmission && (
                      <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-semibold ${differenceInDays(new Date(), new Date(d.dateEmission)) >= 14 ? 'bg-red-100 text-red-700' : differenceInDays(new Date(), new Date(d.dateEmission)) >= 7 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                        <Clock className="h-3 w-3" />{differenceInDays(new Date(), new Date(d.dateEmission))}j
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/devis/${d.id}`}><Button variant="ghost" size="sm">Voir</Button></Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
