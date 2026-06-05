import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatutEvenementBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Building2, Calendar, Euro } from 'lucide-react'

const STATUTS = [
  { key: 'OPPORTUNITE', label: 'Opportunité' },
  { key: 'OPTION',      label: 'Option' },
  { key: 'CONFIRME',    label: 'Confirmé' },
  { key: 'FACTURE',     label: 'Facturé' },
  { key: 'ANNULE',      label: 'Annulé' },
]

export default async function PipelinePage() {
  const session = await auth()
  const orgId = (session?.user as any)?.organisationId

  const evenements = await prisma.evenement.findMany({
    where: { organisationId: orgId, deletedAt: null },
    include: {
      client: true,
      _count: { select: { devis: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const byStatut = STATUTS.map(({ key, label }) => ({
    key,
    label,
    items: evenements.filter((e) => e.statut === key),
    totalBudget: evenements
      .filter((e) => e.statut === key)
      .reduce((sum, e) => sum + (e.budgetIndicatif ?? 0), 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline<span className="text-[#C41230]"> /</span></h1>
        <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble du pipeline commercial</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {byStatut.map(({ key, label, items }) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed pipeline */}
      <div className="space-y-6">
        {byStatut.filter((s) => s.items.length > 0).map(({ key, label, items, totalBudget }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatutEvenementBadge statut={key as any} />
                <span className="text-sm text-gray-500">{items.length} événement(s)</span>
              </div>
              {totalBudget > 0 && (
                <span className="text-sm font-medium text-gray-600">
                  Budget total: {formatCurrency(totalBudget)}
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map((ev) => (
                <Link key={ev.id} href={`/evenements/${ev.id}`}>
                  <Card className="hover:border-[#C41230]/20 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-900 mb-1">{ev.nom}</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        {ev.client && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {ev.client.raisonSociale}
                          </div>
                        )}
                        {ev.dateDebut && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(ev.dateDebut)}
                          </div>
                        )}
                        {ev.budgetIndicatif && (
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            {formatCurrency(ev.budgetIndicatif)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
