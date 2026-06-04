'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return session
}

export async function getEvenements(filters?: {
  statut?: string
  clientId?: string
  search?: string
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.evenement.findMany({
    where: {
      organisationId: orgId,
      deletedAt: null,
      ...(filters?.statut ? { statut: filters.statut as any } : {}),
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
      ...(filters?.search ? {
        OR: [
          { nom: { contains: filters.search } },
          { lieu: { contains: filters.search } },
        ],
      } : {}),
    },
    include: {
      client: true,
      commercial: true,
      _count: { select: { devis: true, taches: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getEvenement(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.evenement.findFirst({
    where: { id, organisationId: orgId, deletedAt: null },
    include: {
      client: true,
      commercial: true,
      devis: {
        where: { deletedAt: null },
        include: { lignes: true },
        orderBy: { createdAt: 'desc' },
      },
      factures: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      taches: {
        orderBy: { dueDate: 'asc' },
        include: { assigne: true },
      },
    },
  })
}

export async function createEvenement(data: {
  nom: string
  type?: string
  statut?: string
  dateDebut?: string
  dateFin?: string
  heureDebut?: string
  heureFin?: string
  typeHoraire?: string
  nombreParticipants?: number
  budgetIndicatif?: number
  lieu?: string
  brief?: string
  notes?: string
  clientId?: string
  commercialId?: string
  probabilite?: number
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const evenement = await prisma.evenement.create({
    data: {
      ...data,
      type: (data.type || 'AUTRE') as any,
      statut: (data.statut || 'PROSPECTION') as any,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
      dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      organisationId: orgId,
    },
  })

  revalidatePath('/evenements')
  return evenement
}

export async function updateEvenement(id: string, data: {
  nom?: string
  type?: string
  statut?: string
  dateDebut?: string | null
  dateFin?: string | null
  heureDebut?: string
  heureFin?: string
  typeHoraire?: string
  nombreParticipants?: number
  budgetIndicatif?: number
  lieu?: string
  brief?: string
  notes?: string
  clientId?: string
  commercialId?: string
  probabilite?: number
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const updateData: any = { ...data }
  if (data.type) updateData.type = data.type as any
  if (data.statut) updateData.statut = data.statut as any
  if (data.dateDebut !== undefined) updateData.dateDebut = data.dateDebut ? new Date(data.dateDebut) : null
  if (data.dateFin !== undefined) updateData.dateFin = data.dateFin ? new Date(data.dateFin) : null

  const evenement = await prisma.evenement.update({
    where: { id, organisationId: orgId },
    data: updateData,
  })

  revalidatePath('/evenements')
  revalidatePath(`/evenements/${id}`)
  return evenement
}

export async function updateEvenementStatut(id: string, statut: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.evenement.update({
    where: { id, organisationId: orgId },
    data: { statut: statut as any },
  })

  revalidatePath('/evenements')
}

export async function deleteEvenement(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.evenement.update({
    where: { id, organisationId: orgId },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/evenements')
}
