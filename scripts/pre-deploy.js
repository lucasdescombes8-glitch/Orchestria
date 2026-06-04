const { spawnSync } = require('child_process')
const path = require('path')

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('postgres')) {
  console.log('No postgres DATABASE_URL — skipping pre-deploy migration')
  process.exit(0)
}

const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')

async function migrate() {
  // Use the same adapter pattern as src/lib/prisma.ts
  const { PrismaNeon } = require('@prisma/adapter-neon')
  const { neonConfig } = require('@neondatabase/serverless')
  const ws = require('ws')
  const { PrismaClient } = require('@prisma/client')

  neonConfig.webSocketConstructor = ws
  const adapter = new PrismaNeon({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  try {
    const r1 = await prisma.$executeRawUnsafe(
      `UPDATE "Evenement" SET statut = 'OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
    )
    console.log('✓ StatutEvenement migrated:', r1, 'rows')
  } catch (e) {
    console.log('StatutEvenement skip:', e.message)
  }

  try {
    const r2 = await prisma.$executeRawUnsafe(
      `UPDATE "Utilisateur" SET role = 'CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE')`
    )
    console.log('✓ Role migrated:', r2, 'rows')
  } catch (e) {
    console.log('Role skip:', e.message)
  }

  await prisma.$disconnect()

  console.log('Running prisma db push...')
  const result = spawnSync(prismaBin, ['db', 'push', '--accept-data-loss'], {
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

migrate().catch((e) => {
  console.error('pre-deploy error:', e.message)
  process.exit(1)
})
