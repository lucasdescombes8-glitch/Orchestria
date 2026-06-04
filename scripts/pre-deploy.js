const { spawnSync } = require('child_process')
const path = require('path')

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('postgres')) {
  console.log('No postgres DATABASE_URL — skipping pre-deploy migration')
  process.exit(0)
}

const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')

async function migrate() {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Evenement" SET statut = 'OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
    )
    console.log('✓ StatutEvenement migrated')
  } catch (e) {
    console.log('StatutEvenement skip:', e.message)
  }

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Utilisateur" SET role = 'CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE')`
    )
    console.log('✓ Role migrated')
  } catch (e) {
    console.log('Role skip:', e.message)
  }

  await prisma.$disconnect()

  console.log('Running prisma db push...')
  // Use spawnSync with args array to avoid any shell-level flag stripping
  const result = spawnSync(prismaBin, ['db', 'push', '--accept-data-loss'], {
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    console.error('prisma db push failed with status', result.status)
    process.exit(result.status ?? 1)
  }
}

migrate().catch((e) => {
  console.error('pre-deploy error:', e.message)
  process.exit(1)
})
