'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function getOrgId() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return (session.user as any).organisationId as string
}

const DEFAULT_TYPES = ['Traiteur', 'Photographe', 'Technique', 'Photobooth', 'Fleuriste', 'Piano', 'Autre']

export async function getTypesPrestataire(): Promise<string[]> {
  const orgId = await getOrgId()
  const rows = await prisma.typePrestataire.findMany({
    where: { organisationId: orgId },
    orderBy: { createdAt: 'asc' },
  })
  if (rows.length === 0) return DEFAULT_TYPES
  return rows.map((r) => r.nom)
}

export async function addTypePrestataire(nom: string) {
  const orgId = await getOrgId()

  // Seed defaults first if this is the first custom entry
  const existing = await prisma.typePrestataire.findMany({ where: { organisationId: orgId } })
  if (existing.length === 0) {
    await prisma.typePrestataire.createMany({
      data: DEFAULT_TYPES.map((n) => ({ nom: n, organisationId: orgId })),
    })
  }

  await prisma.typePrestataire.create({ data: { nom, organisationId: orgId } })
  revalidatePath('/parametres')
  revalidatePath('/clients')
}

export async function deleteTypePrestataire(id: string) {
  await prisma.typePrestataire.delete({ where: { id } })
  revalidatePath('/parametres')
  revalidatePath('/clients')
}
