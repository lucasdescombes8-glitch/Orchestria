import { getFactures } from '@/actions/factures'
import { Button } from '@/components/ui/button'
import { StatutFactureBadge } from '@/components/shared/status-badge'
import { SortableHeader } from '@/components/shared/sortable-header'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Receipt } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

const STATUTS = ['BROUILLON', 'EMISE', 'ENVOYEE', 'PAYEE', 'RETARD', 'ANNULEE'] as const
const STATUT_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon', EMISE: 'Émise', ENVOYEE: 'Envoyée',
  PAYEE: 'Payée', RETARD: 'En retard', ANNULEE: 'Annulée',
}

interface Props {
  searchParams: Promise<{ statut?: string; sort?: string; order?: string }>
}

export default async function FacturesPage({ searchParams }: Props) {
  const params = await searchParams
  const sort = params.sort ?? 'dateEmission'
  const order = params.order ?? 'desc'

  const factures = await getFactures(params.statut ? { statut: params.statut } : undefined)

  const sorted = [...factures].sort((a, b) => {
    let va: any, vb: any
    if (sort === 'numero') { va = a.numero; vb = b.numero }
    else if (sort === 'dateEmission') { va = a.dateEmission ? new Date(a.dateEmission).getTime() : 0; vb = b.dateEmission ? new Date(b.dateEmission).getTime() : 0 }
    else if (sort === 'dateEcheance') { va = a.dateEcheance ? new Date(a.dateEcheance).getTime() : 0; vb = b.dateEcheance ? new Date(b.dateEcheance).getTime() : 0 }
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
          <h1 className="text-2xl font-bold text-gray-900">Facturation<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{factures.length} facture{factures.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/factures/nouveau"><Button><Plus className="h-4 w-4 mr-2" />Nouvelle facture</Button></Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/factures"><Button variant={!params.statut ? 'default' : 'outline'} size="sm">Toutes</Button></Link>
        {STATUTS.map((s) => (
          <Link key={s} href={`/factures?statut=${s}`}>
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
              <TableHead><SortableHeader label="Date" field="dateEmission" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Échéance" field="dateEcheance" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead className="text-right"><SortableHeader label="Total TTC" field="totalTtc" sort={sort} order={order} searchParams={sp} className="justify-end" /></TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead><SortableHeader label="Statut" field="statut" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  <Receipt className="h-10 w-10 mx-auto mb-2 opacity-20" /><p>Aucune facture</p>
                </TableCell>
              </TableRow>
            ) : sorted.map((f) => (
              <TableRow key={f.id}>
                <TableCell><p className="font-mono text-sm font-semibold text-[#C41230]">{f.numero}</p></TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-gray-900">{f.evenement?.client?.raisonSociale ?? '—'}</p>
                  {f.evenement && <p className="text-xs text-gray-400">{f.evenement.nom}</p>}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(f.dateEmission)}</TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(f.dateEcheance)}</TableCell>
                <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(f.totalTtc)}</TableCell>
                <TableCell className="text-right text-sm">
                  <span className={f.montantPaye >= f.totalTtc ? 'text-emerald-600 font-semibold' : 'text-gray-600'}>
                    {formatCurrency(f.montantPaye)}
                  </span>
                </TableCell>
                <TableCell><StatutFactureBadge statut={f.statut} /></TableCell>
                <TableCell>
                  <Link href={`/factures/${f.id}`}><Button variant="ghost" size="sm">Voir</Button></Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
