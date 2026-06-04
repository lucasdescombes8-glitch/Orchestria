import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ clients: [] }, { status: 401 })
  const orgId = (session.user as any).organisationId

  const clients = await prisma.client.findMany({
    where: { organisationId: orgId, deletedAt: null, actif: true },
    select: {
      id: true,
      raisonSociale: true,
      contacts: { select: { id: true, prenom: true, nom: true, poste: true } },
    },
    orderBy: { raisonSociale: 'asc' },
  })

  return NextResponse.json({ clients })
}
