'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createEvenement } from '@/actions/evenements'
import { getClients } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const TYPES = [
  { value: 'CONFERENCE', label: 'Conférence' },
  { value: 'SEMINAIRE', label: 'Séminaire' },
  { value: 'GALA', label: 'Gala' },
  { value: 'TEAMBUILDING', label: 'Team Building' },
  { value: 'MARIAGE', label: 'Mariage' },
  { value: 'CONGRES', label: 'Congrès' },
  { value: 'SALON', label: 'Salon' },
  { value: 'AUTRE', label: 'Autre' },
]

const STATUTS = [
  { value: 'PROSPECTION', label: 'Prospection' },
  { value: 'OPTION', label: 'Option' },
  { value: 'CONFIRME', label: 'Confirmé' },
  { value: 'EN_COURS', label: 'En cours' },
]

function NouvelEvenementForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledClientId = searchParams.get('clientId')
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Array<{ id: string; raisonSociale: string }>>([])
  const [type, setType] = useState('AUTRE')
  const [statut, setStatut] = useState('PROSPECTION')
  const [clientId, setClientId] = useState(prefilledClientId || '')

  useEffect(() => {
    getClients().then((c) => setClients(c.map((cl) => ({ id: cl.id, raisonSociale: cl.raisonSociale }))))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const ev = await createEvenement({
        nom: formData.get('nom') as string,
        type,
        statut,
        dateDebut: formData.get('dateDebut') as string || undefined,
        dateFin: formData.get('dateFin') as string || undefined,
        nombreParticipants: formData.get('nombreParticipants') ? Number(formData.get('nombreParticipants')) : undefined,
        budgetIndicatif: formData.get('budgetIndicatif') ? Number(formData.get('budgetIndicatif')) : undefined,
        lieu: formData.get('lieu') as string || undefined,
        brief: formData.get('brief') as string || undefined,
        notes: formData.get('notes') as string || undefined,
        clientId: clientId && clientId !== '_none' ? clientId : undefined,
      })
      router.push(`/evenements/${ev.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l&apos;événement *</Label>
              <Input id="nom" name="nom" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statut} onValueChange={setStatut}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sans client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.raisonSociale}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Dates &amp; Lieu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateDebut">Date de début</Label>
                <Input id="dateDebut" name="dateDebut" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFin">Date de fin</Label>
                <Input id="dateFin" name="dateFin" type="datetime-local" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu</Label>
              <Input id="lieu" name="lieu" placeholder="Ville, salle, adresse..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Détails</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombreParticipants">Nombre de participants</Label>
                <Input id="nombreParticipants" name="nombreParticipants" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetIndicatif">Budget indicatif (€)</Label>
                <Input id="budgetIndicatif" name="budgetIndicatif" type="number" min="0" step="0.01" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brief">Brief / Description</Label>
              <Textarea id="brief" name="brief" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/evenements">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : "Créer l'événement"}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function NouvelEvenementPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/evenements">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvel événement</h1>
      </div>
      <Suspense fallback={<div className="text-gray-400">Chargement...</div>}>
        <NouvelEvenementForm />
      </Suspense>
    </div>
  )
}
