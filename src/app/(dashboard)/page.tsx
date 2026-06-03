import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { CaChart } from '@/components/dashboard/ca-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatutEvenementBadge, StatutTacheBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Euro, Calendar, FileText, TrendingUp, CheckSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function DashboardPage() {
  const session = await auth()
  const orgId = (session?.user as any)?.organisationId

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // CA du mois
  const facturesMois = await prisma.facture.findMany({
    where: {
      organisationId: orgId,
      statut: { in: ['PAYEE', 'ENVOYEE', 'EMISE'] },
      dateEmission: { gte: monthStart, lte: monthEnd },
      deletedAt: null,
    },
  })
  const caMois = facturesMois.reduce((sum, f) => sum + f.totalTtc, 0)

  const facturesDernierMois = await prisma.facture.findMany({
    where: {
      organisationId: orgId,
      statut: { in: ['PAYEE', 'ENVOYEE', 'EMISE'] },
      dateEmission: { gte: lastMonthStart, lte: lastMonthEnd },
      deletedAt: null,
    },
  })
  const caLastMois = facturesDernierMois.reduce((sum, f) => sum + f.totalTtc, 0)

  // Événements actifs
  const evenementsActifs = await prisma.evenement.count({
    where: {
      organisationId: orgId,
      statut: { in: ['CONFIRME', 'EN_COURS', 'OPTION'] },
      deletedAt: null,
    },
  })

  // Devis en attente
  const devisEnAttente = await prisma.devis.count({
    where: {
      organisationId: orgId,
      statut: { in: ['ENVOYE', 'VU'] },
      deletedAt: null,
    },
  })

  // Taux de conversion
  const totalDevis = await prisma.devis.count({
    where: { organisationId: orgId, deletedAt: null },
  })
  const devisAcceptes = await prisma.devis.count({
    where: { organisationId: orgId, statut: 'ACCEPTE', deletedAt: null },
  })
  const tauxConversion = totalDevis > 0 ? Math.round((devisAcceptes / totalDevis) * 100) : 0

  // CA sur 12 mois
  const caData = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(now, 11 - i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      return prisma.facture.findMany({
        where: {
          organisationId: orgId,
          statut: { in: ['PAYEE', 'ENVOYEE', 'EMISE'] },
          dateEmission: { gte: start, lte: end },
          deletedAt: null,
        },
      }).then((factures) => ({
        mois: format(date, 'MMM', { locale: fr }),
        ca: factures.reduce((sum, f) => sum + f.totalTtc, 0),
      }))
    })
  )

  // Événements récents
  const recentEvenements = await prisma.evenement.findMany({
    where: { organisationId: orgId, deletedAt: null },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Tâches du jour
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const tachesAujourdhui = await prisma.tache.findMany({
    where: {
      organisationId: orgId,
      statut: { in: ['A_FAIRE', 'EN_COURS'] },
      dueDate: { gte: todayStart, lte: todayEnd },
    },
    include: { evenement: true },
    take: 5,
  })

  const tachesEnRetard = await prisma.tache.findMany({
    where: {
      organisationId: orgId,
      statut: { in: ['A_FAIRE', 'EN_COURS'] },
      dueDate: { lt: todayStart },
    },
    take: 5,
  })

  // Pipeline by statut
  const pipeline = await prisma.evenement.groupBy({
    by: ['statut'],
    where: { organisationId: orgId, deletedAt: null },
    _count: true,
  })

  const pipelineLabels: Record<string, string> = {
    PROSPECTION: 'Prospection',
    OPTION: 'Option',
    CONFIRME: 'Confirmé',
    EN_COURS: 'En cours',
    REALISE: 'Réalisé',
    ANNULE: 'Annulé',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">{format(now, 'EEEE d MMMM yyyy', { locale: fr })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="CA du mois"
          value={formatCurrency(caMois)}
          icon={Euro}
          color="indigo"
          trend={caLastMois > 0 ? {
            value: `${Math.abs(Math.round(((caMois - caLastMois) / caLastMois) * 100))}% vs mois dernier`,
            positive: caMois >= caLastMois,
          } : undefined}
        />
        <KpiCard
          title="Événements actifs"
          value={String(evenementsActifs)}
          icon={Calendar}
          color="green"
        />
        <KpiCard
          title="Devis en attente"
          value={String(devisEnAttente)}
          icon={FileText}
          color="yellow"
        />
        <KpiCard
          title="Taux de conversion"
          value={`${tauxConversion}%`}
          subtitle={`${devisAcceptes} / ${totalDevis} devis`}
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CA Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Chiffre d&apos;affaires — 12 derniers mois</CardTitle>
          </CardHeader>
          <CardContent>
            <CaChart data={caData} />
          </CardContent>
        </Card>

        {/* Pipeline summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline événements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['PROSPECTION', 'OPTION', 'CONFIRME', 'EN_COURS', 'REALISE', 'ANNULE'].map((statut) => {
              const item = pipeline.find((p) => p.statut === statut)
              const count = item?._count ?? 0
              const max = Math.max(...pipeline.map((p) => p._count))
              return (
                <div key={statut} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{pipelineLabels[statut]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: max > 0 ? `${(count / max) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Événements récents</CardTitle>
            <Link href="/evenements" className="text-sm text-indigo-600 hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvenements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun événement</p>
            ) : (
              recentEvenements.map((ev) => (
                <Link key={ev.id} href={`/evenements/${ev.id}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.nom}</p>
                      <p className="text-xs text-gray-400">
                        {ev.client?.raisonSociale ?? 'Sans client'} · {formatDate(ev.dateDebut)}
                      </p>
                    </div>
                    <StatutEvenementBadge statut={ev.statut} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tâches du jour
              {tachesEnRetard.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {tachesEnRetard.length} en retard
                </span>
              )}
            </CardTitle>
            <Link href="/taches" className="text-sm text-indigo-600 hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {tachesAujourdhui.length === 0 && tachesEnRetard.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune tâche pour aujourd&apos;hui</p>
            ) : (
              <>
                {tachesEnRetard.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    <p className="text-sm text-red-700 flex-1 truncate">{t.titre}</p>
                    <StatutTacheBadge statut={t.statut} />
                  </div>
                ))}
                {tachesAujourdhui.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <p className="text-sm text-gray-700 flex-1 truncate">{t.titre}</p>
                    <StatutTacheBadge statut={t.statut} />
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
