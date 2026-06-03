'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDevisById, updateDevisStatut, deleteDevis } from '@/actions/devis'
import { createFactureFromDevis } from '@/actions/factures'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatutDevisBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, Printer, ChevronDown, Send, Check, X as XIcon,
  Receipt, Trash2
} from 'lucide-react'
import Link from 'next/link'

type Devis = Awaited<ReturnType<typeof getDevisById>>

export default function DevisDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [devis, setDevis] = useState<Devis>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const d = await getDevisById(id)
    setDevis(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleStatut(statut: string) {
    await updateDevisStatut(id, statut)
    await load()
  }

  async function handleFacture() {
    if (!devis) return
    const f = await createFactureFromDevis(devis.id)
    router.push(`/factures/${f.id}`)
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce devis ?')) return
    await deleteDevis(id)
    router.push('/devis')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Chargement...</p></div>
  }

  if (!devis) {
    return <div className="text-center py-12 text-gray-400">Devis introuvable</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/devis">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">{devis.numero}</h1>
              <StatutDevisBadge statut={devis.statut} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {devis.evenement?.client?.raisonSociale ?? 'Sans client'}
              {devis.evenement && ` · ${devis.evenement.nom}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer / PDF
          </Button>

          {devis.statut === 'ACCEPTE' && (
            <Button onClick={handleFacture}>
              <Receipt className="h-4 w-4 mr-2" />
              Créer facture
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {devis.statut === 'BROUILLON' && (
                <DropdownMenuItem onClick={() => handleStatut('ENVOYE')}>
                  <Send className="h-4 w-4 mr-2" />
                  Marquer comme envoyé
                </DropdownMenuItem>
              )}
              {['ENVOYE', 'VU'].includes(devis.statut) && (
                <>
                  <DropdownMenuItem onClick={() => handleStatut('ACCEPTE')}>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Marquer comme accepté
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatut('REFUSE')}>
                    <XIcon className="h-4 w-4 mr-2 text-red-500" />
                    Marquer comme refusé
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Print-friendly layout */}
      <div className="print:block">
        <Card>
          <CardContent className="p-8">
            {/* Devis Header */}
            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">DEVIS</h2>
                <p className="text-lg font-mono text-indigo-600">{devis.numero}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p><strong>Date :</strong> {formatDate(devis.dateEmission)}</p>
                {devis.dateValidite && (
                  <p><strong>Valide jusqu&apos;au :</strong> {formatDate(devis.dateValidite)}</p>
                )}
              </div>
            </div>

            {/* Client info */}
            {devis.evenement?.client && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{devis.evenement.client.raisonSociale}</p>
                <p className="text-sm text-gray-600">{devis.evenement.nom}</p>
              </div>
            )}

            {devis.objet && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Objet</p>
                <p className="text-gray-900">{devis.objet}</p>
              </div>
            )}

            {/* Lines */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">P.U. HT</TableHead>
                  <TableHead className="text-right">TVA</TableHead>
                  <TableHead className="text-right">Total HT</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devis.lignes.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.description}</TableCell>
                    <TableCell className="text-right">{l.quantite}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.prixUnitaireHt)}</TableCell>
                    <TableCell className="text-right">{l.tauxTva}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.totalHt)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.totalTtc)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total HT</span>
                  <span>{formatCurrency(devis.totalHt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA</span>
                  <span>{formatCurrency(devis.totalTva)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total TTC</span>
                  <span className="text-indigo-600">{formatCurrency(devis.totalTtc)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {devis.notes && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{devis.notes}</p>
              </div>
            )}
            {devis.conditionsPaiement && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Conditions de paiement</p>
                <p className="text-sm text-gray-600">{devis.conditionsPaiement}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
