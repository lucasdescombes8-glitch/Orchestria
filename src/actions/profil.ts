'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Non authentifié')
  return session
}

export async function updateProfil(data: {
  nom: string
  prenom: string
  email: string
  poste?: string
}) {
  const session = await getSession()
  const userId = (session.user as any).id
  await prisma.utilisateur.update({
    where: { id: userId },
    data,
  })
  revalidatePath('/profil')
}

export async function updateMotDePasse(currentPassword: string, newPassword: string) {
  const session = await getSession()
  const userId = (session.user as any).id

  const user = await prisma.utilisateur.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Utilisateur introuvable')

  const valid = await bcrypt.compare(currentPassword, user.motDePasseHash)
  if (!valid) throw new Error('Mot de passe actuel incorrect')

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.utilisateur.update({ where: { id: userId }, data: { motDePasseHash: hash } })
}

export async function createUtilisateur(data: {
  nom: string
  prenom: string
  email: string
  poste?: string
  role: string
  motDePasse: string
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  const existing = await prisma.utilisateur.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Cet email est déjà utilisé')

  const hash = await bcrypt.hash(data.motDePasse, 12)
  await prisma.utilisateur.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role as any,
      motDePasseHash: hash,
      organisationId: orgId,
    } as any,
  })
  revalidatePath('/profil')
}

export async function updateUtilisateur(id: string, data: {
  nom?: string
  prenom?: string
  email?: string
  poste?: string
  role?: string
  actif?: boolean
}) {
  const session = await getSession()
  const orgId = (session.user as any).organisationId

  await prisma.utilisateur.update({
    where: { id, organisationId: orgId },
    data: { ...data, role: data.role as any },
  })
  revalidatePath('/profil')
}
