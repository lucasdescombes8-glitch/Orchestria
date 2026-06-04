'use client'

import { useState } from 'react'
import { createUtilisateur, updateUtilisateur } from '@/actions/profil'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, X, Check, UserX, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ROLES = ['ADMIN', 'CHEF_PROJET'] as const
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  CHEF_PROJET: 'Chef de projet',
}

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  poste?: string | null
  role: string
  actif: boolean
}

export function UsersManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [newUser, setNewUser] = useState({ prenom: '', nom: '', email: '', poste: '', role: 'CHEF_PROJET', motDePasse: '' })
  const [editData, setEditData] = useState<Partial<User & { motDePasse: string }>>({})

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createUtilisateur(newUser)
      setNewUser({ prenom: '', nom: '', email: '', poste: '', role: 'COMMERCIAL', motDePasse: '' })
      setShowCreate(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string) {
    setLoading(true)
    setError('')
    try {
      await updateUtilisateur(id, { ...editData, poste: editData.poste ?? undefined })
      setEditingId(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActif(user: User) {
    await updateUtilisateur(user.id, { actif: !user.actif })
    router.refresh()
  }

  function startEdit(user: User) {
    setEditingId(user.id)
    setEditData({ prenom: user.prenom, nom: user.nom, email: user.email, poste: user.poste ?? '', role: user.role })
  }

  return (
    <div className="space-y-4">
      {/* Liste */}
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className={`px-5 py-4 ${!u.actif ? 'opacity-50' : ''}`}>
              {editingId === u.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Prénom" value={editData.prenom ?? ''} onChange={(e) => setEditData((d) => ({ ...d, prenom: e.target.value }))} />
                    <Input placeholder="Nom" value={editData.nom ?? ''} onChange={(e) => setEditData((d) => ({ ...d, nom: e.target.value }))} />
                  </div>
                  <Input placeholder="Email" type="email" value={editData.email ?? ''} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} />
                  <Input placeholder="Poste" value={editData.poste ?? ''} onChange={(e) => setEditData((d) => ({ ...d, poste: e.target.value }))} />
                  <select
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                    value={editData.role ?? 'COMMERCIAL'}
                    onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    <Button type="button" size="sm" onClick={() => handleUpdate(u.id)} disabled={loading}>
                      <Check className="h-4 w-4 mr-1" />Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-[#FDF2F4] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#C41230]">{u.prenom[0]}{u.nom[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {u.prenom} {u.nom}
                        {u.id === currentUserId && <span className="ml-2 text-xs text-gray-400">(vous)</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{u.email}{u.poste ? ` · ${u.poste}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(u)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {u.id !== currentUserId && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => handleToggleActif(u)}>
                        {u.actif ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Formulaire création */}
      {showCreate ? (
        <Card className="border-[#C41230]/20">
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <p className="font-medium text-sm text-gray-900">Nouvel utilisateur</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Prénom *</Label>
                  <Input value={newUser.prenom} onChange={(e) => setNewUser((u) => ({ ...u, prenom: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Nom *</Label>
                  <Input value={newUser.nom} onChange={(e) => setNewUser((u) => ({ ...u, nom: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={newUser.email} onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Poste</Label>
                <Input value={newUser.poste} onChange={(e) => setNewUser((u) => ({ ...u, poste: e.target.value }))} placeholder="Chargé d'événements..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Rôle *</Label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                    value={newUser.role}
                    onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Mot de passe *</Label>
                  <Input type="password" value={newUser.motDePasse} onChange={(e) => setNewUser((u) => ({ ...u, motDePasse: e.target.value }))} required placeholder="8 caractères min." />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreate(false); setError('') }}>Annuler</Button>
                <Button type="submit" size="sm" disabled={loading}>
                  <Plus className="h-4 w-4 mr-1" />
                  {loading ? 'Création...' : 'Créer l\'utilisateur'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowCreate(true)} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      )}
    </div>
  )
}
