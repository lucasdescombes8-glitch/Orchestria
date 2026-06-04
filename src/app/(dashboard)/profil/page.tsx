import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfilForm } from './profil-form'
import { PasswordForm } from './password-form'
import { UsersManager } from './users-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Lock, Users } from 'lucide-react'

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as any).id
  const orgId = (session.user as any).organisationId

  const [me, users] = await Promise.all([
    prisma.utilisateur.findUnique({ where: { id: userId } }),
    prisma.utilisateur.findMany({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (!me) redirect('/login')

  const isAdmin = me.role === 'ADMIN'

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil<span className="text-[#C41230]"> /</span></h1>
        <p className="text-sm text-gray-500 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Infos perso */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-[#C41230]" />
          <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <ProfilForm user={me} />
          </CardContent>
        </Card>
      </div>

      {/* Mot de passe + gestion utilisateurs (admin uniquement) */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#C41230]" />
            <h2 className="text-lg font-semibold text-gray-900">Mot de passe</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <PasswordForm />
            </CardContent>
          </Card>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#C41230]" />
            <h2 className="text-lg font-semibold text-gray-900">Utilisateurs</h2>
          </div>
          <UsersManager users={users} currentUserId={userId} />
        </div>
      )}
    </div>
  )
}
