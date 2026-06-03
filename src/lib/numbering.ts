import { prisma } from './prisma'

export async function generateNumeroDevis(orgId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.devis.count({ where: { organisationId: orgId } })
  return `DEV-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function generateNumeroFacture(orgId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.facture.count({ where: { organisationId: orgId } })
  return `FAC-${year}-${String(count + 1).padStart(4, '0')}`
}
