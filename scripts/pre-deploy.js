const { spawnSync } = require('child_process')
const path = require('path')

const url = process.env.DATABASE_URL
if (!url || !url.startsWith('postgres')) {
  console.log('No postgres DATABASE_URL — skipping pre-deploy migration')
  process.exit(0)
}

const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma')
const sqlFile = path.join(__dirname, 'migrate-data.sql')

function runPrisma(args) {
  const result = spawnSync(prismaBin, args, { stdio: 'inherit', env: process.env })
  return result.status ?? 1
}

// Step 1: migrate data using same TCP connection as db push
console.log('Migrating data...')
const migrateStatus = runPrisma(['db', 'execute', '--file', sqlFile])
if (migrateStatus !== 0) {
  console.log('Migration returned non-zero, continuing anyway...')
}

// Step 2: push schema
console.log('Running prisma db push...')
const pushStatus = runPrisma(['db', 'push', '--accept-data-loss'])
if (pushStatus !== 0) {
  console.error('prisma db push failed')
  process.exit(pushStatus)
}
