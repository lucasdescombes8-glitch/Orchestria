'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return session
}

export async function getClients(search?: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.client.findMany({
    where: {
      organisationId: orgId,
      deletedAt: null,
      actif: true,
      ...(search ? {
        OR: [
          { raisonSociale: { contains: search } },
          { email: { contains: search } },
          { ville: { contains: search } },
        ],
      } : {}),
    },
    include: {
      contacts: true,
      _count: { select: { evenements: true } },
    },
    orderBy: { raisonSociale: 'asc' },
  })
}

export async function getClient(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  return prisma.client.findFirst({
    where: { id, organisationId: orgId, deletedAt: null },
    include: {
      contacts: true,
      evenements: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createClient(data: {
  raisonSociale: string
  siret?: string
  email?: string
  telephone?: string
  adresse?: string
  codePostal?: string
  ville?: string
  secteur?: string
  notes?: string
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const client = await prisma.client.create({
    data: {
      ...data,
      organisationId: orgId,
    },
  })

  revalidatePath('/clients')
  return client
}

export async function updateClient(id: string, data: {
  raisonSociale?: string
  siret?: string
  email?: string
  telephone?: string
  adresse?: string
  codePostal?: string
  ville?: string
  secteur?: string
  notes?: string
  satisfaction?: number | null
  notesSatisfaction?: string
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const client = await prisma.client.update({
    where: { id, organisationId: orgId },
    data,
  })

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return client
}

export async function deleteClient(id: string) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.client.update({
    where: { id, organisationId: orgId },
    data: { deletedAt: new Date(), actif: false },
  })

  revalidatePath('/clients')
}

export async function createContact(clientId: string, data: {
  prenom: string
  nom: string
  poste?: string
  email?: string
  telephone?: string
  mobile?: string
  principal?: boolean
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const client = await prisma.client.findFirst({
    where: { id: clientId, organisationId: orgId },
  })
  if (!client) throw new Error('Client non trouvé')

  const contact = await prisma.contact.create({
    data: { ...data, clientId },
  })

  revalidatePath(`/clients/${clientId}`)
  return contact
}

export async function updateContact(id: string, data: {
  prenom?: string
  nom?: string
  poste?: string
  email?: string
  telephone?: string
  mobile?: string
  principal?: boolean
}) {
  await prisma.contact.update({ where: { id }, data })
  revalidatePath('/clients')
}

export async function deleteContact(id: string, clientId: string) {
  await prisma.contact.delete({ where: { id } })
  revalidatePath(`/clients/${clientId}`)
}
