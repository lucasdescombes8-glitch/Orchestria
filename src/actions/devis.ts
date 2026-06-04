'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateNumeroDevis } from '@/lib/numbering'
import { calculateLigne, calculateTotals } from '@/lib/utils'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return session
}

export async function getDevis(filters?: { statut?: string; evenementId?: string }) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.devis.findMany({
    where: {
      organisationId: orgId,
      deletedAt: null,
      ...(filters?.statut ? { statut: filters.statut as any } : {}),
      ...(filters?.evenementId ? { evenementId: filters.evenementId } : {}),
    },
    include: {
      evenement: { include: { client: true } },
      lignes: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getDevisById(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.devis.findFirst({
    where: { id, organisationId: orgId, deletedAt: null },
    include: {
      evenement: { include: { client: true } },
      lignes: { orderBy: { ordre: 'asc' } },
    },
  })
}

type LigneInput = {
  description: string
  quantite: number
  prixUnitaireHt: number
  tauxTva: number
}

export async function createDevis(data: {
  evenementId?: string
  objet?: string
  dateValidite?: string
  notes?: string
  conditionsPaiement?: string
  lignes: LigneInput[]
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const numero = await generateNumeroDevis(orgId)
  const lignesCalculees = data.lignes.map((l, i) => {
    const { totalHt, totalTtc } = calculateLigne(l.quantite, l.prixUnitaireHt, l.tauxTva)
    return { ...l, ordre: i + 1, totalHt, totalTtc }
  })
  const { totalHt, totalTva, totalTtc } = calculateTotals(lignesCalculees)

  const devis = await prisma.devis.create({
    data: {
      numero,
      organisationId: orgId,
      evenementId: data.evenementId,
      objet: data.objet,
      dateValidite: data.dateValidite ? new Date(data.dateValidite) : undefined,
      notes: data.notes,
      conditionsPaiement: data.conditionsPaiement,
      totalHt,
      totalTva,
      totalTtc,
      lignes: {
        create: lignesCalculees,
      },
    },
    include: { lignes: true },
  })

  revalidatePath('/devis')
  if (data.evenementId) revalidatePath(`/evenements/${data.evenementId}`)
  return devis
}

export async function updateDevis(id: string, data: {
  objet?: string
  dateValidite?: string
  notes?: string
  conditionsPaiement?: string
  lignes: LigneInput[]
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const lignesCalculees = data.lignes.map((l, i) => {
    const { totalHt, totalTtc } = calculateLigne(l.quantite, l.prixUnitaireHt, l.tauxTva)
    return { ...l, ordre: i + 1, totalHt, totalTtc }
  })
  const { totalHt, totalTva, totalTtc } = calculateTotals(lignesCalculees)

  await prisma.ligneDevis.deleteMany({ where: { devisId: id } })

  const devis = await prisma.devis.update({
    where: { id, organisationId: orgId },
    data: {
      objet: data.objet,
      dateValidite: data.dateValidite ? new Date(data.dateValidite) : undefined,
      notes: data.notes,
      conditionsPaiement: data.conditionsPaiement,
      totalHt,
      totalTva,
      totalTtc,
      lignes: {
        create: lignesCalculees,
      },
    },
    include: { lignes: true },
  })

  revalidatePath('/devis')
  revalidatePath(`/devis/${id}`)
  return devis
}

export async function updateDevisStatut(id: string, statut: string, motifRefus?: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.devis.update({
    where: { id, organisationId: orgId },
    data: { statut: statut as any, ...(motifRefus !== undefined ? { motifRefus } : {}) },
  })

  revalidatePath('/devis')
  revalidatePath(`/devis/${id}`)
}

export async function deleteDevis(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.devis.update({
    where: { id, organisationId: orgId },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/devis')
}
