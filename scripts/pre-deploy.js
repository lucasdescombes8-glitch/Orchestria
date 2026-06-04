const { execSync } = require('child_process')

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('postgres')) process.exit(0)

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

prisma.$executeRawUnsafe(
  `UPDATE "Evenement" SET statut='OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE')`
)
  .catch(() => {})
  .finally(async () => {
    await prisma.$disconnect()
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
  })
