const { execSync } = require('child_process')

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('postgres')) {
  console.log('No postgres DATABASE_URL — skipping pre-deploy migration')
  process.exit(0)
}

async function run() {
  // Use neon serverless HTTP driver — works in all build environments
  const { neon } = require('@neondatabase/serverless')
  const sql = neon(url)

  try {
    await sql`UPDATE "Evenement" SET statut = 'OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
    console.log('✓ StatutEvenement migration done')
  } catch (e) {
    console.log('StatutEvenement migration skipped:', e.message)
  }

  try {
    await sql`UPDATE "Utilisateur" SET role = 'CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE')`
    console.log('✓ Role migration done')
  } catch (e) {
    console.log('Role migration skipped:', e.message)
  }

  console.log('Running prisma db push...')
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
}

run().catch((e) => {
  console.error('pre-deploy failed:', e.message)
  process.exit(1)
})
