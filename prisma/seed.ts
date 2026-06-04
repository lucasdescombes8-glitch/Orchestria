import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed...')

  const org = await prisma.organisation.upsert({
    where: { id: 'org-demo' },
    update: {},
    create: {
      id: 'org-demo',
      nom: 'Orchestria Demo',
      email: 'contact@orchestria.fr',
      telephone: '01 23 45 67 89',
      adresse: '12 rue de la Paix',
      couleurPrim: '#6366f1',
    },
  })
  console.log('✓ Organisation créée:', org.nom)

  const hash = await bcrypt.hash('Admin1234!', 12)
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@orchestria.fr' },
    update: {},
    create: {
      organisationId: org.id,
      email: 'admin@orchestria.fr',
      nom: 'Dupont',
      prenom: 'Alice',
      motDePasseHash: hash,
      role: 'ADMIN',
    },
  })
  console.log('✓ Admin créé:', admin.email)

  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client-1' },
      update: {},
      create: {
        id: 'client-1',
        organisationId: org.id,
        raisonSociale: 'TechCorp France SAS',
        siret: '12345678901234',
        email: 'contact@techcorp.fr',
        telephone: '01 44 55 66 77',
        adresse: '15 Avenue des Champs-Élysées',
        codePostal: '75008',
        ville: 'Paris',
        secteur: 'Technologie',
        notes: 'Client premium, budget élevé',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-2' },
      update: {},
      create: {
        id: 'client-2',
        organisationId: org.id,
        raisonSociale: 'Groupe Luxe & Co',
        email: 'events@luxeco.fr',
        telephone: '01 56 78 90 12',
        codePostal: '75001',
        ville: 'Paris',
        secteur: 'Luxe',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-3' },
      update: {},
      create: {
        id: 'client-3',
        organisationId: org.id,
        raisonSociale: 'Mairie de Lyon',
        email: 'evenements@mairie-lyon.fr',
        telephone: '04 72 10 30 30',
        codePostal: '69001',
        ville: 'Lyon',
        secteur: 'Secteur public',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-4' },
      update: {},
      create: {
        id: 'client-4',
        organisationId: org.id,
        raisonSociale: 'StartupBoost SARL',
        email: 'team@startupboost.io',
        telephone: '07 89 01 23 45',
        codePostal: '69003',
        ville: 'Lyon',
        secteur: 'Startup',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-5' },
      update: {},
      create: {
        id: 'client-5',
        organisationId: org.id,
        raisonSociale: 'Château Beaumont',
        email: 'info@chateaubeaumont.fr',
        telephone: '05 56 30 22 22',
        codePostal: '33250',
        ville: 'Bordeaux',
        secteur: 'Hôtellerie',
      },
    }),
  ])
  console.log('✓', clients.length, 'clients créés')

  await Promise.all([
    prisma.contact.upsert({
      where: { id: 'contact-1' },
      update: {},
      create: {
        id: 'contact-1',
        clientId: 'client-1',
        prenom: 'Marc',
        nom: 'Leblanc',
        poste: 'Directeur Marketing',
        email: 'marc.leblanc@techcorp.fr',
        telephone: '06 12 34 56 78',
        principal: true,
      },
    }),
    prisma.contact.upsert({
      where: { id: 'contact-2' },
      update: {},
      create: {
        id: 'contact-2',
        clientId: 'client-1',
        prenom: 'Sophie',
        nom: 'Martin',
        poste: 'Responsable RH',
        email: 'sophie.martin@techcorp.fr',
        mobile: '06 98 76 54 32',
      },
    }),
    prisma.contact.upsert({
      where: { id: 'contact-3' },
      update: {},
      create: {
        id: 'contact-3',
        clientId: 'client-2',
        prenom: 'Isabella',
        nom: 'Rossi',
        poste: 'Events Manager',
        email: 'isabella.rossi@luxeco.fr',
        mobile: '06 55 44 33 22',
        principal: true,
      },
    }),
    prisma.contact.upsert({
      where: { id: 'contact-4' },
      update: {},
      create: {
        id: 'contact-4',
        clientId: 'client-3',
        prenom: 'Jean-Pierre',
        nom: 'Durand',
        poste: 'Chef de Cabinet',
        email: 'jp.durand@mairie-lyon.fr',
        telephone: '04 72 10 30 31',
        principal: true,
      },
    }),
    prisma.contact.upsert({
      where: { id: 'contact-5' },
      update: {},
      create: {
        id: 'contact-5',
        clientId: 'client-5',
        prenom: 'Antoine',
        nom: 'Beaumont',
        poste: 'Propriétaire',
        email: 'antoine@chateaubeaumont.fr',
        mobile: '06 30 22 11 00',
        principal: true,
      },
    }),
  ])
  console.log('✓ Contacts créés')

  const now = new Date()
  const evenements = await Promise.all([
    prisma.evenement.upsert({
      where: { id: 'event-1' },
      update: {},
      create: {
        id: 'event-1',
        organisationId: org.id,
        clientId: 'client-1',
        commercialId: admin.id,
        nom: 'Séminaire annuel TechCorp 2026',
        type: 'SEMINAIRE',
        statut: 'CONFIRME',
        dateDebut: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        dateFin: new Date(now.getFullYear(), now.getMonth() + 1, 17),
        nombreParticipants: 200,
        budgetIndicatif: 45000,
        lieu: 'Centre de Conférences La Défense, Paris',
        probabilite: 90,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-2' },
      update: {},
      create: {
        id: 'event-2',
        organisationId: org.id,
        clientId: 'client-2',
        commercialId: admin.id,
        nom: 'Lancement Collection Automne Luxe & Co',
        type: 'GALA',
        statut: 'OPTION',
        dateDebut: new Date(now.getFullYear(), now.getMonth() + 2, 8),
        nombreParticipants: 150,
        budgetIndicatif: 80000,
        lieu: 'Pavillon Cambon Capucines, Paris',
        probabilite: 60,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-3' },
      update: {},
      create: {
        id: 'event-3',
        organisationId: org.id,
        clientId: 'client-3',
        nom: 'Congrès Municipal Lyon 2026',
        type: 'CONGRES',
        statut: 'PROSPECTION',
        dateDebut: new Date(now.getFullYear(), now.getMonth() + 3, 20),
        nombreParticipants: 500,
        budgetIndicatif: 120000,
        lieu: 'Centre des Congrès de Lyon',
        probabilite: 40,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-4' },
      update: {},
      create: {
        id: 'event-4',
        organisationId: org.id,
        clientId: 'client-4',
        commercialId: admin.id,
        nom: 'Team Building StartupBoost',
        type: 'TEAMBUILDING',
        statut: 'EN_COURS',
        dateDebut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        dateFin: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6),
        nombreParticipants: 50,
        budgetIndicatif: 15000,
        lieu: 'Domaine des Pins, Ardèche',
        probabilite: 100,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-5' },
      update: {},
      create: {
        id: 'event-5',
        organisationId: org.id,
        clientId: 'client-5',
        nom: 'Mariage Beaumont-Laurent',
        type: 'MARIAGE',
        statut: 'REALISE',
        dateDebut: new Date(now.getFullYear(), now.getMonth() - 1, 12),
        nombreParticipants: 180,
        budgetIndicatif: 65000,
        lieu: 'Château Beaumont, Bordeaux',
        probabilite: 100,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-6' },
      update: {},
      create: {
        id: 'event-6',
        organisationId: org.id,
        clientId: 'client-1',
        nom: 'Conférence Innovation Paris',
        type: 'CONFERENCE',
        statut: 'CONFIRME',
        dateDebut: new Date(now.getFullYear(), now.getMonth() + 1, 28),
        nombreParticipants: 300,
        budgetIndicatif: 35000,
        lieu: 'Palais Brongniart, Paris',
        probabilite: 95,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-7' },
      update: {},
      create: {
        id: 'event-7',
        organisationId: org.id,
        clientId: 'client-2',
        nom: 'Salon Mode & Luxe',
        type: 'SALON',
        statut: 'PROSPECTION',
        dateDebut: new Date(now.getFullYear(), now.getMonth() + 4, 5),
        nombreParticipants: 800,
        budgetIndicatif: 200000,
        lieu: 'Porte de Versailles, Paris',
        probabilite: 30,
      },
    }),
    prisma.evenement.upsert({
      where: { id: 'event-8' },
      update: {},
      create: {
        id: 'event-8',
        organisationId: org.id,
        clientId: 'client-4',
        nom: 'Soirée annulation client',
        type: 'SEMINAIRE',
        statut: 'ANNULE',
        dateDebut: new Date(now.getFullYear(), now.getMonth() - 2, 10),
        nombreParticipants: 80,
        budgetIndicatif: 12000,
        lieu: 'Hôtel Mercure Lyon',
        probabilite: 0,
      },
    }),
  ])
  console.log('✓', evenements.length, 'événements créés')

  await prisma.devis.upsert({
    where: { id: 'devis-1' },
    update: {},
    create: {
      id: 'devis-1',
      numero: 'DEV-2026-0001',
      organisationId: org.id,
      evenementId: 'event-1',
      statut: 'ACCEPTE',
      objet: 'Organisation Séminaire annuel TechCorp 2026',
      dateEmission: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      dateValidite: new Date(now.getFullYear(), now.getMonth(), 1),
      totalHt: 37500,
      totalTva: 7500,
      totalTtc: 45000,
      conditionsPaiement: '30% à la commande, 70% à la réalisation',
      lignes: {
        create: [
          { ordre: 1, description: 'Coordination générale (3 jours)', quantite: 3, prixUnitaireHt: 2500, tauxTva: 20, totalHt: 7500, totalTtc: 9000 },
          { ordre: 2, description: 'Location salle et équipements AV', quantite: 1, prixUnitaireHt: 15000, tauxTva: 20, totalHt: 15000, totalTtc: 18000 },
          { ordre: 3, description: 'Restauration (200 personnes x 2 déjeuners)', quantite: 400, prixUnitaireHt: 35, tauxTva: 10, totalHt: 14000, totalTtc: 15400 },
          { ordre: 4, description: 'Hébergement nuit 1', quantite: 200, prixUnitaireHt: 5, tauxTva: 10, totalHt: 1000, totalTtc: 1100 },
        ],
      },
    },
  })

  await prisma.devis.upsert({
    where: { id: 'devis-2' },
    update: {},
    create: {
      id: 'devis-2',
      numero: 'DEV-2026-0002',
      organisationId: org.id,
      evenementId: 'event-2',
      statut: 'ENVOYE',
      objet: 'Soirée de lancement Collection Automne',
      dateEmission: new Date(now.getFullYear(), now.getMonth(), 5),
      dateValidite: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      totalHt: 66667,
      totalTva: 13333,
      totalTtc: 80000,
      lignes: {
        create: [
          { ordre: 1, description: 'Direction artistique', quantite: 1, prixUnitaireHt: 12000, tauxTva: 20, totalHt: 12000, totalTtc: 14400 },
          { ordre: 2, description: 'Location Pavillon Cambon', quantite: 1, prixUnitaireHt: 25000, tauxTva: 20, totalHt: 25000, totalTtc: 30000 },
          { ordre: 3, description: 'Cocktail dînatoire (150 personnes)', quantite: 150, prixUnitaireHt: 195, tauxTva: 20, totalHt: 29250, totalTtc: 35100 },
          { ordre: 4, description: 'DJ et animation musicale', quantite: 1, prixUnitaireHt: 3500, tauxTva: 20, totalHt: 3500, totalTtc: 4200 },
        ],
      },
    },
  })

  await prisma.devis.upsert({
    where: { id: 'devis-3' },
    update: {},
    create: {
      id: 'devis-3',
      numero: 'DEV-2026-0003',
      organisationId: org.id,
      evenementId: 'event-4',
      statut: 'BROUILLON',
      objet: 'Team Building StartupBoost 2 jours',
      dateEmission: new Date(),
      totalHt: 12500,
      totalTva: 2500,
      totalTtc: 15000,
      lignes: {
        create: [
          { ordre: 1, description: 'Programme team building outdoor (2 jours)', quantite: 50, prixUnitaireHt: 150, tauxTva: 20, totalHt: 7500, totalTtc: 9000 },
          { ordre: 2, description: 'Hébergement et repas (50 personnes x 1 nuit)', quantite: 50, prixUnitaireHt: 100, tauxTva: 20, totalHt: 5000, totalTtc: 6000 },
        ],
      },
    },
  })
  console.log('✓ Devis créés')

  await prisma.facture.upsert({
    where: { id: 'facture-1' },
    update: {},
    create: {
      id: 'facture-1',
      numero: 'FAC-2026-0001',
      organisationId: org.id,
      evenementId: 'event-5',
      statut: 'PAYEE',
      type: 'FACTURE',
      objet: 'Mariage Beaumont-Laurent',
      dateEmission: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      dateEcheance: new Date(now.getFullYear(), now.getMonth(), 15),
      totalHt: 54167,
      totalTva: 10833,
      totalTtc: 65000,
      montantPaye: 65000,
      lignes: {
        create: [
          { ordre: 1, description: 'Organisation et coordination complète', quantite: 1, prixUnitaireHt: 15000, tauxTva: 20, totalHt: 15000, totalTtc: 18000 },
          { ordre: 2, description: 'Décoration florale', quantite: 1, prixUnitaireHt: 12000, tauxTva: 20, totalHt: 12000, totalTtc: 14400 },
          { ordre: 3, description: 'Traiteur (180 personnes)', quantite: 180, prixUnitaireHt: 150, tauxTva: 10, totalHt: 27000, totalTtc: 29700 },
          { ordre: 4, description: 'Animation musicale', quantite: 1, prixUnitaireHt: 5000, tauxTva: 20, totalHt: 5000, totalTtc: 6000 },
        ],
      },
      reglements: {
        create: [
          { montant: 32500, date: new Date(now.getFullYear(), now.getMonth() - 2, 10), mode: 'VIREMENT', reference: 'VIR-2026-001' },
          { montant: 32500, date: new Date(now.getFullYear(), now.getMonth(), 5), mode: 'VIREMENT', reference: 'VIR-2026-042' },
        ],
      },
    },
  })

  await prisma.facture.upsert({
    where: { id: 'facture-2' },
    update: {},
    create: {
      id: 'facture-2',
      numero: 'FAC-2026-0002',
      organisationId: org.id,
      evenementId: 'event-1',
      statut: 'ENVOYEE',
      type: 'FACTURE',
      objet: 'Acompte 30% - Séminaire TechCorp 2026',
      dateEmission: new Date(now.getFullYear(), now.getMonth(), 10),
      dateEcheance: new Date(now.getFullYear(), now.getMonth(), 25),
      totalHt: 11250,
      totalTva: 2250,
      totalTtc: 13500,
      montantPaye: 0,
      lignes: {
        create: [
          { ordre: 1, description: 'Acompte 30% sur devis DEV-2026-0001', quantite: 1, prixUnitaireHt: 11250, tauxTva: 20, totalHt: 11250, totalTtc: 13500 },
        ],
      },
    },
  })
  console.log('✓ Factures créées')

  await Promise.all([
    prisma.tache.upsert({
      where: { id: 'tache-1' },
      update: {},
      create: {
        id: 'tache-1',
        organisationId: org.id,
        evenementId: 'event-1',
        assigneId: admin.id,
        titre: 'Confirmer le traiteur pour le séminaire',
        statut: 'A_FAIRE',
        priorite: 'HAUTE',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      },
    }),
    prisma.tache.upsert({
      where: { id: 'tache-2' },
      update: {},
      create: {
        id: 'tache-2',
        organisationId: org.id,
        evenementId: 'event-2',
        assigneId: admin.id,
        titre: 'Soumettre devis Luxe & Co pour validation',
        statut: 'A_FAIRE',
        priorite: 'URGENTE',
        dueDate: new Date(),
      },
    }),
    prisma.tache.upsert({
      where: { id: 'tache-3' },
      update: {},
      create: {
        id: 'tache-3',
        organisationId: org.id,
        evenementId: 'event-4',
        assigneId: admin.id,
        titre: 'Préparer le programme détaillé team building',
        statut: 'EN_COURS',
        priorite: 'NORMALE',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      },
    }),
    prisma.tache.upsert({
      where: { id: 'tache-4' },
      update: {},
      create: {
        id: 'tache-4',
        organisationId: org.id,
        titre: 'Relancer StartupBoost pour signature devis',
        statut: 'A_FAIRE',
        priorite: 'HAUTE',
        dueDate: new Date(),
      },
    }),
  ])
  console.log('✓ Tâches créées')
  console.log('\n✅ Seed terminé avec succès!')
  console.log('📧 Connexion: admin@orchestria.fr / Admin1234!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
