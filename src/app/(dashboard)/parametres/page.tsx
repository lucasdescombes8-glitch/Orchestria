import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Settings, Wrench } from 'lucide-react'
import { TypesPrestatairManager } from './types-prestataire-manager'

const ROLES = [
  {
    name: 'ADMIN',
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités, gestion des utilisateurs et de la configuration.',
    permissions: ['Gestion utilisateurs', 'Configuration organisation', 'Tous les modules', 'Suppression de données'],
    color: 'destructive',
  },
  {
    name: 'MANAGER',
    label: 'Manager',
    description: 'Accès à tous les modules métier. Peut créer, modifier et supprimer des données.',
    permissions: ['Clients & Contacts', 'Projets & Événements', 'Devis & Factures', 'Tâches', 'Calendrier'],
    color: 'warning',
  },
  {
    name: 'COMMERCIAL',
    label: 'Commercial',
    description: 'Accès aux modules clients, projets et devis. Peut créer et modifier ses propres données.',
    permissions: ['Clients & Contacts', 'Projets (lecture)', 'Devis (création)', 'Tâches (les siennes)'],
    color: 'info',
  },
] as const

export default async function ParametresPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const orgId = (session.user as any)?.organisationId as string | undefined
  if (!orgId) redirect('/login')

  let users: { id: string; nom: string; prenom: string; email: string; role: string; actif: boolean }[] = []
  let dbTypes: { id: string; nom: string }[] = []
  try {
    users = await prisma.utilisateur.findMany({
      where: { organisationId: orgId },
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true },
      orderBy: { createdAt: 'asc' },
    })
    dbTypes = await prisma.typePrestataire.findMany({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'asc' },
    })
  } catch {
    // DB not available locally
  }

  const currentUser = (session.user as any)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres<span className="text-[#C41230]"> /</span></h1>
        <p className="text-sm text-gray-500 mt-1">Configuration et gestion des rôles</p>
      </div>

      {/* Roles section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#C41230]" />
          <h2 className="text-lg font-semibold text-gray-900">Rôles et permissions</h2>
        </div>
        <div className="grid gap-4">
          {ROLES.map((role) => (
            <Card key={role.name}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{role.label}</p>
                      <Badge variant={role.color as any}>{role.name}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {role.permissions.map((p) => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{p}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Users section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#C41230]" />
          <h2 className="text-lg font-semibold text-gray-900">Utilisateurs</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-sm">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Nom</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Rôle</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.prenom} {u.nom}
                        {u.email === currentUser.email && (
                          <span className="ml-2 text-xs text-gray-400">(vous)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          u.role === 'ADMIN' ? 'destructive' :
                          u.role === 'MANAGER' ? 'warning' : 'info'
                        }>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${u.actif ? 'text-green-600' : 'text-gray-400'}`}>
                          {u.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Types de prestataires */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#C41230]" />
          <h2 className="text-lg font-semibold text-gray-900">Types de prestataires</h2>
        </div>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-4">
              Ces types apparaissent lors de la création ou modification d&apos;une entreprise de type prestataire.
            </p>
            <TypesPrestatairManager types={dbTypes} />
            {dbTypes.length === 0 && (
              <p className="text-xs text-gray-400 mt-3">
                Aucun type personnalisé — les types par défaut sont utilisés (Traiteur, Photographe, Technique, Photobooth, Fleuriste, Piano, Autre).
                Ajoutez un type pour personnaliser la liste.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organisation settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#C41230]" />
          <h2 className="text-lg font-semibold text-gray-900">Organisation</h2>
        </div>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nom de l&apos;organisation</p>
                <p className="font-medium text-gray-900 mt-0.5">Palais de la Bourse Lyon</p>
              </div>
              <div>
                <p className="text-gray-500">Module actifs</p>
                <p className="font-medium text-gray-900 mt-0.5">Clients, Projets, Devis, Facturation, Calendrier</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
