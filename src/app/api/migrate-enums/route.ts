import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const r1 = await prisma.$executeRawUnsafe(
    `UPDATE "Evenement" SET statut = 'OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
  )
  const r2 = await prisma.$executeRawUnsafe(
    `UPDATE "Utilisateur" SET role = 'CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE')`
  )
  return NextResponse.json({ ok: true, evenements_updated: r1, utilisateurs_updated: r2 })
}
