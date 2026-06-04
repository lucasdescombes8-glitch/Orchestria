import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Check if already seeded
    const existing = await prisma.organisation.findUnique({ where: { id: 'org-demo' } })
    if (existing) {
      return NextResponse.json({ message: 'Déjà initialisé', status: 'ok' })
    }

    const org = await prisma.organisation.create({
      data: {
        id: 'org-demo',
        nom: 'Orchestria Demo',
        email: 'contact@orchestria.fr',
        telephone: '01 23 45 67 89',
        adresse: '12 rue de la Paix',
        couleurPrim: '#6366f1',
      },
    })

    const hash = await bcrypt.hash('Admin1234!', 12)
    await prisma.utilisateur.create({
      data: {
        organisationId: org.id,
        email: 'admin@orchestria.fr',
        nom: 'Dupont',
        prenom: 'Alice',
        motDePasseHash: hash,
        role: 'ADMIN',
      },
    })

    // Clients
    await prisma.client.createMany({
      data: [
        { id: 'client-1', organisationId: org.id, raisonSociale: 'TechCorp France SAS', email: 'contact@techcorp.fr', telephone: '01 44 55 66 77', ville: 'Paris', secteur: 'Technologie' },
        { id: 'client-2', organisationId: org.id, raisonSociale: 'Groupe Luxe & Co', email: 'events@luxeco.fr', ville: 'Paris', secteur: 'Luxe' },
        { id: 'client-3', organisationId: org.id, raisonSociale: 'Mairie de Lyon', email: 'evenements@mairie-lyon.fr', ville: 'Lyon', secteur: 'Secteur public' },
        { id: 'client-4', organisationId: org.id, raisonSociale: 'StartupBoost SARL', email: 'team@startupboost.io', ville: 'Lyon', secteur: 'Startup' },
        { id: 'client-5', organisationId: org.id, raisonSociale: 'Château Beaumont', email: 'info@chateaubeaumont.fr', ville: 'Bordeaux', secteur: 'Hôtellerie' },
      ],
    })

    const now = new Date()
    await prisma.evenement.createMany({
      data: [
        { id: 'event-1', organisationId: org.id, clientId: 'client-1', nom: 'Séminaire annuel TechCorp 2026', type: 'SEMINAIRE', statut: 'CONFIRME', dateDebut: new Date(now.getFullYear(), now.getMonth() + 1, 15), nombreParticipants: 200, budgetIndicatif: 45000, lieu: 'Centre de Conférences La Défense, Paris', probabilite: 90 },
        { id: 'event-2', organisationId: org.id, clientId: 'client-2', nom: 'Lancement Collection Automne Luxe & Co', type: 'GALA', statut: 'OPTION', dateDebut: new Date(now.getFullYear(), now.getMonth() + 2, 8), nombreParticipants: 150, budgetIndicatif: 80000, probabilite: 60 },
        { id: 'event-3', organisationId: org.id, clientId: 'client-3', nom: 'Congrès Municipal Lyon 2026', type: 'CONGRES', statut: 'OPTION', dateDebut: new Date(now.getFullYear(), now.getMonth() + 3, 20), nombreParticipants: 500, budgetIndicatif: 120000, probabilite: 40 },
        { id: 'event-4', organisationId: org.id, clientId: 'client-4', nom: 'Team Building StartupBoost', type: 'TEAMBUILDING', statut: 'CONFIRME', dateDebut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5), nombreParticipants: 50, budgetIndicatif: 15000, probabilite: 100 },
        { id: 'event-5', organisationId: org.id, clientId: 'client-5', nom: 'Mariage Beaumont-Laurent', type: 'MARIAGE', statut: 'CONFIRME', dateDebut: new Date(now.getFullYear(), now.getMonth() - 1, 12), nombreParticipants: 180, budgetIndicatif: 65000, probabilite: 100 },
        { id: 'event-6', organisationId: org.id, clientId: 'client-1', nom: 'Conférence Innovation Paris', type: 'CONFERENCE', statut: 'CONFIRME', dateDebut: new Date(now.getFullYear(), now.getMonth() + 1, 28), nombreParticipants: 300, budgetIndicatif: 35000, probabilite: 95 },
      ],
    })

    return NextResponse.json({ message: '✅ Base initialisée avec succès !', login: 'admin@orchestria.fr', password: 'Admin1234!' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
