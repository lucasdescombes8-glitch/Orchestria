import { notFound } from 'next/navigation'
import { getEvenement } from '@/actions/evenements'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatutEvenementBadge, StatutDevisBadge, StatutFactureBadge, StatutTacheBadge, PrioriteBadge } from '@/components/shared/status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Calendar, MapPin, Users, Euro, Building2, Plus, FileText, Receipt
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
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

export default async function EvenementDetailPage({ params }: Props) {
  const { id } = await params
  const ev = await getEvenement(id)

  if (!ev) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/evenements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{ev.nom}</h1>
              <StatutEvenementBadge statut={ev.statut} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {ev.client && (
                <Link href={`/clients/${ev.client.id}`} className="flex items-center gap-1 hover:text-[#C41230]">
                  <Building2 className="h-3.5 w-3.5" />
                  {ev.client.raisonSociale}
                </Link>
              )}
              <Badge variant="secondary">{typeLabels[ev.type] ?? ev.type}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/devis/nouveau?evenementId=${ev.id}`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar className="h-4 w-4" />
            Début
          </div>
          <p className="font-medium">{formatDate(ev.dateDebut)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar className="h-4 w-4" />
            Fin
          </div>
          <p className="font-medium">{formatDate(ev.dateFin)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Users className="h-4 w-4" />
            Participants
          </div>
          <p className="font-medium">{ev.nombreParticipants ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Euro className="h-4 w-4" />
            Budget indicatif
          </div>
          <p className="font-medium">{ev.budgetIndicatif ? formatCurrency(ev.budgetIndicatif) : '—'}</p>
        </div>
      </div>

      {ev.lieu && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-xl border p-4">
          <MapPin className="h-4 w-4 text-gray-400" />
          {ev.lieu}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="infos">
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="devis">Devis ({ev.devis.length})</TabsTrigger>
          <TabsTrigger value="factures">Factures ({ev.factures.length})</TabsTrigger>
          <TabsTrigger value="taches">Tâches ({ev.taches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="infos" className="mt-4">
          <div className="grid gap-4">
            {ev.brief && (
              <Card>
                <CardHeader><CardTitle className="text-base">Brief</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{ev.brief}</p>
                </CardContent>
              </Card>
            )}
            {ev.notes && (
              <Card>
                <CardHeader><CardTitle className="text-base">Notes internes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{ev.notes}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle className="text-base">Commercial assigné</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {ev.commercial ? `${ev.commercial.prenom} ${ev.commercial.nom}` : 'Non assigné'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devis" className="mt-4">
          <div className="space-y-3">
            <div className="flex justify-end">
              <Link href={`/devis/nouveau?evenementId=${ev.id}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nouveau devis
                </Button>
              </Link>
            </div>
            {ev.devis.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucun devis pour cet événement</p>
                </CardContent>
              </Card>
            ) : (
              ev.devis.map((d) => (
                <Link key={d.id} href={`/devis/${d.id}`}>
                  <Card className="hover:border-[#C41230]/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{d.numero}</p>
                        <p className="text-sm text-gray-500">{d.objet ?? 'Sans objet'} · {formatDate(d.dateEmission)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{formatCurrency(d.totalTtc)}</span>
                        <StatutDevisBadge statut={d.statut} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="factures" className="mt-4">
          <div className="space-y-3">
            {ev.factures.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucune facture pour cet événement</p>
                </CardContent>
              </Card>
            ) : (
              ev.factures.map((f) => (
                <Link key={f.id} href={`/factures/${f.id}`}>
                  <Card className="hover:border-[#C41230]/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{f.numero}</p>
                        <p className="text-sm text-gray-500">{formatDate(f.dateEmission)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{formatCurrency(f.totalTtc)}</span>
                        <StatutFactureBadge statut={f.statut} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="taches" className="mt-4">
          <div className="space-y-3">
            {ev.taches.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  <p>Aucune tâche pour cet événement</p>
                </CardContent>
              </Card>
            ) : (
              ev.taches.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t.titre}</p>
                      {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Échéance: {formatDate(t.dueDate)}
                        {t.assigne && ` · Assigné à ${t.assigne.prenom} ${t.assigne.nom}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PrioriteBadge priorite={t.priorite} />
                      <StatutTacheBadge statut={t.statut} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
