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
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const orgId = (session.user as any)?.organisationId as string | undefined

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">Session invalide. <a href="/login" className="text-[#C41230] underline">Se reconnecter</a></p>
      </div>
    )
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  try {
    const [
      facturesMois,
      facturesDernierMois,
      evenementsActifs,
      devisEnAttente,
      totalDevis,
      devisAcceptes,
      recentEvenements,
      tachesAujourdhui,
      tachesEnRetard,
      pipeline,
    ] = await Promise.all([
      prisma.facture.findMany({
        where: { organisationId: orgId, statut: { in: ['PAYEE', 'ENVOYEE', 'EMISE'] }, dateEmission: { gte: monthStart, lte: monthEnd }, deletedAt: null },
      }),
      prisma.facture.findMany({
        where: { organisationId: orgId, statut: { in: ['PAYEE', 'ENVOYEE', 'EMISE'] }, dateEmission: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null },
      }),
      prisma.evenement.count({
        where: { organisationId: orgId, statut: { in: ['CONFIRME', 'EN_COURS', 'OPTION'] }, deletedAt: null },
      }),
      prisma.devis.count({
        where: { organisationId: orgId, statut: { in: ['ENVOYE', 'VU'] }, deletedAt: null },
      }),
      prisma.devis.count({ where: { organisationId: orgId, deletedAt: null } }),
      prisma.devis.count({ where: { organisationId: orgId, statut: 'ACCEPTE', deletedAt: null } }),
      prisma.evenement.findMany({
        where: { organisationId: orgId, deletedAt: null },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.tache.findMany({
        where: {
          organisationId: orgId,
          statut: { in: ['A_FAIRE', 'EN_COURS'] },
          dueDate: { gte: new Date(now.setHours(0,0,0,0)), lte: new Date(now.setHours(23,59,59,999)) },
        },
        include: { evenement: true },
        take: 5,
      }),
      prisma.tache.findMany({
        where: { organisationId: orgId, statut: { in: ['A_FAIRE', 'EN_COURS'] }, dueDate: { lt: new Date() } },
        take: 5,
      }),
      prisma.evenement.groupBy({
        by: ['statut'],
        where: { organisationId: orgId, deletedAt: null },
        _count: true,
      }),
    ])

    const caMois = facturesMois.reduce((sum, f) => sum + f.totalTtc, 0)
    const caLastMois = facturesDernierMois.reduce((sum, f) => sum + f.totalTtc, 0)
    const tauxConversion = totalDevis > 0 ? Math.round((devisAcceptes / totalDevis) * 100) : 0

    const caData = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), 11 - i)
        return prisma.facture.findMany({
          where: { organisationId: orgId, statut: { in: ['PAYEE', 'ENVOYEE', 'EMISE'] }, dateEmission: { gte: startOfMonth(date), lte: endOfMonth(date) }, deletedAt: null },
        }).then((factures) => ({
          mois: format(date, 'MMM', { locale: fr }),
          ca: factures.reduce((sum, f) => sum + f.totalTtc, 0),
        }))
      })
    )

    const pipelineLabels: Record<string, string> = {
      PROSPECTION: 'Prospection', OPTION: 'Option', CONFIRME: 'Confirmé',
      EN_COURS: 'En cours', REALISE: 'Réalisé', ANNULE: 'Annulé',
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord<span className="text-[#C41230]"> /</span></h1>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="CA du mois" value={formatCurrency(caMois)} icon={Euro} color="indigo"
            trend={caLastMois > 0 ? { value: `${Math.abs(Math.round(((caMois - caLastMois) / caLastMois) * 100))}% vs mois dernier`, positive: caMois >= caLastMois } : undefined}
          />
          <KpiCard title="Événements actifs" value={String(evenementsActifs)} icon={Calendar} color="green" />
          <KpiCard title="Devis en attente" value={String(devisEnAttente)} icon={FileText} color="yellow" />
          <KpiCard title="Taux de conversion" value={`${tauxConversion}%`} subtitle={`${devisAcceptes} / ${totalDevis} devis`} icon={TrendingUp} color="indigo" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Chiffre d&apos;affaires — 12 derniers mois</CardTitle></CardHeader>
            <CardContent><CaChart data={caData} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Pipeline événements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['PROSPECTION', 'OPTION', 'CONFIRME', 'EN_COURS', 'REALISE', 'ANNULE'].map((statut) => {
                const item = pipeline.find((p) => p.statut === statut)
                const count = item?._count ?? 0
                const max = Math.max(...pipeline.map((p) => p._count), 1)
                return (
                  <div key={statut} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{pipelineLabels[statut]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C41230] rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Événements récents</CardTitle>
              <Link href="/evenements" className="text-sm text-[#C41230] hover:underline">Voir tout</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEvenements.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aucun événement</p>
              ) : recentEvenements.map((ev) => (
                <Link key={ev.id} href={`/evenements/${ev.id}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.nom}</p>
                      <p className="text-xs text-gray-400">{ev.client?.raisonSociale ?? 'Sans client'} · {formatDate(ev.dateDebut)}</p>
                    </div>
                    <StatutEvenementBadge statut={ev.statut} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />Tâches du jour
                {tachesEnRetard.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />{tachesEnRetard.length} en retard
                  </span>
                )}
              </CardTitle>
              <Link href="/taches" className="text-sm text-[#C41230] hover:underline">Voir tout</Link>
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
                      <div className="h-2 w-2 rounded-full bg-[#C41230] shrink-0" />
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
  } catch (error: any) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800">Erreur de connexion à la base de données</h2>
        <pre className="text-sm text-red-600 bg-red-50 p-4 rounded-lg max-w-2xl w-full overflow-auto">
          {error?.message ?? String(error)}
        </pre>
        <p className="text-gray-500 text-sm">Si c'est la première utilisation, allez d'abord sur <a href="/api/setup" className="text-[#C41230] underline">/api/setup</a></p>
      </div>
    )
  }
}
