const { execSync } = require('child_process')

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('postgres')) process.exit(0)

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrate() {
  try {
    // Migrate old StatutEvenement values
    await prisma.$executeRawUnsafe(
      `UPDATE "Evenement" SET statut='OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
    )
  } catch (e) {
    console.log('StatutEvenement migration skipped:', e.message)
  }

  try {
    // Migrate old Role values — map old roles to CHEF_PROJET
    await prisma.$executeRawUnsafe(
      `UPDATE "Utilisateur" SET role='CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE')`
    )
  } catch (e) {
    console.log('Role migration skipped:', e.message)
  }

  await prisma.$disconnect()
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
}

migrate().catch(async (e) => {
  console.error('pre-deploy error:', e)
  await prisma.$disconnect()
  process.exit(1)
})
