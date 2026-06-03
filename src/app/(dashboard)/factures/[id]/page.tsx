'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getFactureById, updateFactureStatut, addReglement } from '@/actions/factures'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatutFactureBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ArrowLeft, Printer, ChevronDown, Plus } from 'lucide-react'
import Link from 'next/link'

type Facture = Awaited<ReturnType<typeof getFactureById>>

export default function FactureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [facture, setFacture] = useState<Facture>(null)
  const [loading, setLoading] = useState(true)
  const [reglOpen, setReglOpen] = useState(false)
  const [reglMontant, setReglMontant] = useState('')
  const [reglDate, setReglDate] = useState(new Date().toISOString().split('T')[0])
  const [reglMode, setReglMode] = useState('VIREMENT')
  const [reglRef, setReglRef] = useState('')

  async function load() {
    const f = await getFactureById(id)
    setFacture(f)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleStatut(statut: string) {
    await updateFactureStatut(id, statut)
    await load()
  }

  async function handleReglement(e: React.FormEvent) {
    e.preventDefault()
    if (!facture) return
    await addReglement(facture.id, {
      montant: parseFloat(reglMontant),
      date: reglDate,
      mode: reglMode,
      reference: reglRef || undefined,
    })
    setReglOpen(false)
    setReglMontant('')
    await load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Chargement...</p></div>
  if (!facture) return <div className="text-center py-12 text-gray-400">Facture introuvable</div>

  const resteAPayer = facture.totalTtc - facture.montantPaye

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/factures">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">{facture.numero}</h1>
              <StatutFactureBadge statut={facture.statut} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {facture.evenement?.client?.raisonSociale ?? 'Sans client'}
              {facture.evenement && ` · ${facture.evenement.nom}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>

          {resteAPayer > 0 && ['EMISE', 'ENVOYEE', 'RETARD'].includes(facture.statut) && (
            <Dialog open={reglOpen} onOpenChange={setReglOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Enregistrer un paiement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enregistrer un règlement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReglement} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Montant</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={reglMontant}
                      onChange={(e) => setReglMontant(e.target.value)}
                      placeholder={`Reste à payer: ${formatCurrency(resteAPayer)}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={reglDate} onChange={(e) => setReglDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mode de paiement</Label>
                    <Select value={reglMode} onValueChange={setReglMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIREMENT">Virement</SelectItem>
                        <SelectItem value="CHEQUE">Chèque</SelectItem>
                        <SelectItem value="CARTE">Carte</SelectItem>
                        <SelectItem value="ESPECES">Espèces</SelectItem>
                        <SelectItem value="PRELEVEMENT">Prélèvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Référence</Label>
                    <Input value={reglRef} onChange={(e) => setReglRef(e.target.value)} placeholder="N° virement..." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setReglOpen(false)}>Annuler</Button>
                    <Button type="submit">Enregistrer</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions <ChevronDown className="h-4 w-4 ml-2" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {facture.statut === 'BROUILLON' && (
                <DropdownMenuItem onClick={() => handleStatut('EMISE')}>Marquer comme émise</DropdownMenuItem>
              )}
              {facture.statut === 'EMISE' && (
                <DropdownMenuItem onClick={() => handleStatut('ENVOYEE')}>Marquer comme envoyée</DropdownMenuItem>
              )}
              {['EMISE', 'ENVOYEE', 'RETARD'].includes(facture.statut) && (
                <DropdownMenuItem onClick={() => handleStatut('PAYEE')} className="text-green-600">
                  Marquer comme payée
                </DropdownMenuItem>
              )}
              {facture.statut !== 'ANNULEE' && (
                <DropdownMenuItem onClick={() => handleStatut('ANNULEE')} className="text-red-600">
                  Annuler
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Payment summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total TTC</p>
            <p className="text-xl font-bold">{formatCurrency(facture.totalTtc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Payé</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(facture.montantPaye)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Reste à payer</p>
            <p className={`text-xl font-bold ${resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(resteAPayer)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facture content */}
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">FACTURE</h2>
              <p className="text-lg font-mono text-indigo-600">{facture.numero}</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><strong>Date :</strong> {formatDate(facture.dateEmission)}</p>
              {facture.dateEcheance && (
                <p><strong>Échéance :</strong> {formatDate(facture.dateEcheance)}</p>
              )}
            </div>
          </div>

          {facture.evenement?.client && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">{facture.evenement.client.raisonSociale}</p>
              <p className="text-sm text-gray-600">{facture.evenement.nom}</p>
            </div>
          )}

          {facture.objet && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Objet</p>
              <p className="text-gray-900">{facture.objet}</p>
            </div>
          )}

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
              {facture.lignes.map((l) => (
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

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total HT</span>
                <span>{formatCurrency(facture.totalHt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA</span>
                <span>{formatCurrency(facture.totalTva)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total TTC</span>
                <span className="text-indigo-600">{formatCurrency(facture.totalTtc)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reglements */}
      {facture.reglements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Règlements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facture.reglements.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>{r.mode}</TableCell>
                    <TableCell>{r.reference ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.montant)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
