import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CalendarView } from './calendar-view'

export default async function CalendrierPage() {
  const session = await auth()
  const orgId = (session?.user as any)?.organisationId

  const evenements = await prisma.evenement.findMany({
    where: { organisationId: orgId, deletedAt: null },
    select: {
      id: true,
      nom: true,
      statut: true,
      type: true,
      dateDebut: true,
      dateFin: true,
      lieu: true,
      client: { select: { raisonSociale: true } },
    },
    orderBy: { dateDebut: 'asc' },
  })

  const serialized = evenements.map((e) => ({
    ...e,
    dateDebut: e.dateDebut?.toISOString() ?? null,
    dateFin: e.dateFin?.toISOString() ?? null,
  }))

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
        <p className="text-sm text-gray-500 mt-1">Planning des ressources</p>
      </div>
      <CalendarView evenements={serialized} />
    </div>
  )
}
