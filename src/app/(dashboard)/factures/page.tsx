import { getFactures } from '@/actions/factures'
import { Button } from '@/components/ui/button'
import { StatutFactureBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Receipt } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

const STATUTS = ['BROUILLON', 'EMISE', 'ENVOYEE', 'PAYEE', 'RETARD', 'ANNULEE'] as const

interface Props {
  searchParams: Promise<{ statut?: string }>
}

export default async function FacturesPage({ searchParams }: Props) {
  const params = await searchParams
  const factures = await getFactures(params.statut ? { statut: params.statut } : undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
          <p className="text-sm text-gray-500 mt-1">{factures.length} facture(s)</p>
        </div>
        <Link href="/factures/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/factures">
          <Button variant={!params.statut ? 'default' : 'outline'} size="sm">Toutes</Button>
        </Link>
        {STATUTS.map((s) => (
          <Link key={s} href={`/factures?statut=${s}`}>
            <Button variant={params.statut === s ? 'default' : 'outline'} size="sm">
              {s === 'BROUILLON' ? 'Brouillon' :
               s === 'EMISE' ? 'Émise' :
               s === 'ENVOYEE' ? 'Envoyée' :
               s === 'PAYEE' ? 'Payée' :
               s === 'RETARD' ? 'En retard' : 'Annulée'}
            </Button>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client / Événement</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  <Receipt className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Aucune facture</p>
                </TableCell>
              </TableRow>
            ) : (
              factures.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <p className="font-mono text-sm font-medium text-indigo-600">{f.numero}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {f.evenement?.client?.raisonSociale ?? '—'}
                      </p>
                      {f.evenement && (
                        <p className="text-xs text-gray-400">{f.evenement.nom}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(f.dateEmission)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(f.dateEcheance)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(f.totalTtc)}</TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={f.montantPaye >= f.totalTtc ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {formatCurrency(f.montantPaye)}
                    </span>
                  </TableCell>
                  <TableCell><StatutFactureBadge statut={f.statut} /></TableCell>
                  <TableCell>
                    <Link href={`/factures/${f.id}`}>
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
