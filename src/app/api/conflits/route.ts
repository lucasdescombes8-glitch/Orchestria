import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = (session.user as any)?.organisationId as string | undefined
  if (!orgId) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const { searchParams } = request.nextUrl
  const dateDebut = searchParams.get('dateDebut')
  const dateFin = searchParams.get('dateFin')
  const lieu = searchParams.get('lieu')
  const excludeId = searchParams.get('excludeId')

  if (!dateDebut) return NextResponse.json({ conflits: [] })

  const start = new Date(dateDebut)
  const end = dateFin ? new Date(dateFin) : new Date(dateDebut)

  try {
    const conflits = await prisma.evenement.findMany({
      where: {
        organisationId: orgId,
        deletedAt: null,
        statut: { in: ['OPTION', 'CONFIRME'] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          { dateDebut: { lte: end }, dateFin: { gte: start } },
          { dateDebut: { gte: start, lte: end } },
          { dateFin: { gte: start, lte: end } },
        ],
        ...(lieu ? { lieu: { contains: lieu, mode: 'insensitive' } } : {}),
      },
      select: { id: true, nom: true, statut: true, dateDebut: true, dateFin: true, lieu: true },
      take: 5,
    })

    return NextResponse.json({ conflits })
  } catch {
    return NextResponse.json({ conflits: [] })
  }
}
