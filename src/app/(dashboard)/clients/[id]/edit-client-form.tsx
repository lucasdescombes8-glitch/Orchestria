'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClient, deleteClient } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Trash2 } from 'lucide-react'

interface Client {
  id: string
  raisonSociale: string
  siret?: string | null
  email?: string | null
  telephone?: string | null
  adresse?: string | null
  codePostal?: string | null
  ville?: string | null
  secteur?: string | null
  notes?: string | null
}

export function EditClientForm({ client }: { client: Client }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      await updateClient(client.id, {
        raisonSociale: formData.get('raisonSociale') as string,
        siret: formData.get('siret') as string || undefined,
        email: formData.get('email') as string || undefined,
        telephone: formData.get('telephone') as string || undefined,
        adresse: formData.get('adresse') as string || undefined,
        codePostal: formData.get('codePostal') as string || undefined,
        ville: formData.get('ville') as string || undefined,
        secteur: formData.get('secteur') as string || undefined,
        notes: formData.get('notes') as string || undefined,
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce client ?')) return
    await deleteClient(client.id)
    router.push('/clients')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raisonSociale">Raison sociale</Label>
            <Input id="raisonSociale" name="raisonSociale" defaultValue={client.raisonSociale} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input id="siret" name="siret" defaultValue={client.siret ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client.email ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" defaultValue={client.telephone ?? ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secteur">Secteur</Label>
            <Input id="secteur" name="secteur" defaultValue={client.secteur ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" name="adresse" defaultValue={client.adresse ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codePostal">Code postal</Label>
              <Input id="codePostal" name="codePostal" defaultValue={client.codePostal ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" name="ville" defaultValue={client.ville ?? ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={client.notes ?? ''} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Enregistrement...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  )
}
