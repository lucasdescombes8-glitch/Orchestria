'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return session
}

export async function getTaches(filters?: {
  statut?: string
  assigneId?: string
  evenementId?: string
  today?: boolean
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return prisma.tache.findMany({
    where: {
      organisationId: orgId,
      ...(filters?.statut ? { statut: filters.statut as any } : {}),
      ...(filters?.assigneId ? { assigneId: filters.assigneId } : {}),
      ...(filters?.evenementId ? { evenementId: filters.evenementId } : {}),
      ...(filters?.today ? {
        dueDate: { gte: todayStart, lte: today },
      } : {}),
    },
    include: {
      assigne: true,
      evenement: true,
    },
    orderBy: [{ priorite: 'desc' }, { dueDate: 'asc' }],
  })
}

export async function createTache(data: {
  titre: string
  description?: string
  statut?: string
  priorite?: string
  dueDate?: string
  evenementId?: string
  assigneId?: string
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const tache = await prisma.tache.create({
    data: {
      ...data,
      organisationId: orgId,
      statut: (data.statut || 'A_FAIRE') as any,
      priorite: (data.priorite || 'NORMALE') as any,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  })

  revalidatePath('/taches')
  if (data.evenementId) revalidatePath(`/evenements/${data.evenementId}`)
  return tache
}

export async function updateTache(id: string, data: {
  titre?: string
  description?: string
  statut?: string
  priorite?: string
  dueDate?: string
  assigneId?: string
}) {
  const updateData: any = { ...data }
  if (data.statut) updateData.statut = data.statut as any
  if (data.priorite) updateData.priorite = data.priorite as any
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
  if (data.statut === 'TERMINEE') updateData.completedAt = new Date()

  await prisma.tache.update({ where: { id }, data: updateData })
  revalidatePath('/taches')
}

export async function deleteTache(id: string) {
  await prisma.tache.delete({ where: { id } })
  revalidatePath('/taches')
}
