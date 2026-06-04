'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClient, deleteClient } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Trash2, Building2, Wrench } from 'lucide-react'
import { PrestataireTypeSelect } from '@/components/shared/prestataire-type-select'

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
  typeEntreprise?: string | null
  typePrestataire?: string | null
}

const DEFAULT_TYPES = ['Traiteur', 'Photographe', 'Technique', 'Photobooth', 'Fleuriste', 'Piano', 'Autre']

export function EditClientForm({ client, typesPrestataire = DEFAULT_TYPES }: { client: Client; typesPrestataire?: string[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [typeEntreprise, setTypeEntreprise] = useState<string>(client.typeEntreprise ?? 'CLIENT')
  const [typePrestataire, setTypePrestataire] = useState<string>(client.typePrestataire ?? '')

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
        typeEntreprise,
        typePrestataire: typeEntreprise === 'PRESTATAIRE' ? typePrestataire || null : null,
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
      {/* Type d'entreprise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Type d&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(['CLIENT', 'PRESTATAIRE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeEntreprise(t)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  typeEntreprise === t ? 'border-[#C41230] bg-[#FDF2F4]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t === 'CLIENT'
                  ? <Building2 className={`h-4 w-4 ${typeEntreprise === t ? 'text-[#C41230]' : 'text-gray-400'}`} />
                  : <Wrench className={`h-4 w-4 ${typeEntreprise === t ? 'text-[#C41230]' : 'text-gray-400'}`} />
                }
                <span className={`text-sm font-medium ${typeEntreprise === t ? 'text-[#C41230]' : 'text-gray-700'}`}>
                  {t === 'CLIENT' ? 'Client' : 'Prestataire'}
                </span>
              </button>
            ))}
          </div>
          {typeEntreprise === 'PRESTATAIRE' && (
            <div className="mt-3 space-y-2">
              <Label>Type de prestataire</Label>
              <PrestataireTypeSelect types={typesPrestataire} value={typePrestataire} onChange={setTypePrestataire} />
            </div>
          )}
        </CardContent>
      </Card>

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
