'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateNumeroFacture } from '@/lib/numbering'
import { calculateLigne, calculateTotals } from '@/lib/utils'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return session
}

export async function getFactures(filters?: { statut?: string }) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.facture.findMany({
    where: {
      organisationId: orgId,
      deletedAt: null,
      ...(filters?.statut ? { statut: filters.statut as any } : {}),
    },
    include: {
      evenement: { include: { client: true } },
      lignes: true,
      reglements: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFactureById(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.facture.findFirst({
    where: { id, organisationId: orgId, deletedAt: null },
    include: {
      evenement: { include: { client: true } },
      devis: true,
      lignes: { orderBy: { ordre: 'asc' } },
      reglements: { orderBy: { date: 'desc' } },
    },
  })
}

type LigneInput = {
  description: string
  quantite: number
  prixUnitaireHt: number
  tauxTva: number
}

export async function createFactureFromDevis(devisId: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const devis = await prisma.devis.findFirst({
    where: { id: devisId, organisationId: orgId },
    include: { lignes: true },
  })
  if (!devis) throw new Error('Devis non trouvé')

  const numero = await generateNumeroFacture(orgId)

  const facture = await prisma.facture.create({
    data: {
      numero,
      organisationId: orgId,
      evenementId: devis.evenementId,
      devisId: devis.id,
      objet: devis.objet,
      totalHt: devis.totalHt,
      totalTva: devis.totalTva,
      totalTtc: devis.totalTtc,
      lignes: {
        create: devis.lignes.map((l) => ({
          ordre: l.ordre,
          description: l.description,
          quantite: l.quantite,
          prixUnitaireHt: l.prixUnitaireHt,
          tauxTva: l.tauxTva,
          totalHt: l.totalHt,
          totalTtc: l.totalTtc,
        })),
      },
    },
  })

  revalidatePath('/factures')
  return facture
}

export async function createFacture(data: {
  evenementId?: string
  objet?: string
  dateEcheance?: string
  notes?: string
  type?: string
  lignes: LigneInput[]
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const numero = await generateNumeroFacture(orgId)
  const lignesCalculees = data.lignes.map((l, i) => {
    const { totalHt, totalTtc } = calculateLigne(l.quantite, l.prixUnitaireHt, l.tauxTva)
    return { ...l, ordre: i + 1, totalHt, totalTtc }
  })
  const { totalHt, totalTva, totalTtc } = calculateTotals(lignesCalculees)

  const facture = await prisma.facture.create({
    data: {
      numero,
      organisationId: orgId,
      evenementId: data.evenementId,
      type: (data.type || 'FACTURE') as any,
      objet: data.objet,
      dateEcheance: data.dateEcheance ? new Date(data.dateEcheance) : undefined,
      notes: data.notes,
      totalHt,
      totalTva,
      totalTtc,
      lignes: {
        create: lignesCalculees,
      },
    },
  })

  revalidatePath('/factures')
  return facture
}

export async function updateFactureStatut(id: string, statut: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.facture.update({
    where: { id, organisationId: orgId },
    data: { statut: statut as any },
  })

  revalidatePath('/factures')
  revalidatePath(`/factures/${id}`)
}

export async function addReglement(factureId: string, data: {
  montant: number
  date: string
  mode: string
  reference?: string
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const facture = await prisma.facture.findFirst({
    where: { id: factureId, organisationId: orgId },
    include: { reglements: true },
  })
  if (!facture) throw new Error('Facture non trouvée')

  await prisma.reglement.create({
    data: {
      factureId,
      montant: data.montant,
      date: new Date(data.date),
      mode: data.mode as any,
      reference: data.reference,
    },
  })

  const totalPaye = facture.reglements.reduce((sum, r) => sum + r.montant, 0) + data.montant
  const newStatut = totalPaye >= facture.totalTtc ? 'PAYEE' : 'ENVOYEE'

  await prisma.facture.update({
    where: { id: factureId },
    data: { montantPaye: totalPaye, statut: newStatut as any },
  })

  revalidatePath(`/factures/${factureId}`)
  revalidatePath('/factures')
}

export async function deleteFacture(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.facture.update({
    where: { id, organisationId: orgId },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/factures')
}
