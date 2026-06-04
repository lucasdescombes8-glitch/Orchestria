'use client'

import { useState } from 'react'
import { updateProfil } from '@/actions/profil'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, CheckCircle2 } from 'lucide-react'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  poste?: string | null
  role: string
}

export function ProfilForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    try {
      await updateProfil({
        prenom: fd.get('prenom') as string,
        nom: fd.get('nom') as string,
        email: fd.get('email') as string,
        poste: fd.get('poste') as string || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom</Label>
          <Input id="prenom" name="prenom" defaultValue={user.prenom} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" defaultValue={user.nom} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="poste">Poste</Label>
        <Input id="poste" name="poste" defaultValue={user.poste ?? ''} placeholder="Directeur commercial, Chargé d'événements..." />
      </div>
      <div className="space-y-1">
        <Label className="text-gray-400">Rôle</Label>
        <p className="text-sm font-medium text-gray-700 bg-gray-50 rounded-xl px-3.5 py-2.5">{user.role}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {saved ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? 'Sauvegardé !' : loading ? 'Enregistrement...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  )
}
