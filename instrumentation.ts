export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('@/lib/prisma')
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Evenement" SET statut = 'OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
      )
      await prisma.$executeRawUnsafe(
        `UPDATE "Utilisateur" SET role = 'CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE')`
      )
    } catch (e) {
      console.error('[instrumentation] migration error:', e)
    }
  }
}
