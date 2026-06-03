'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createDevis } from '@/actions/devis'
import { getEvenements } from '@/actions/evenements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LignesDevisForm, type Ligne } from '@/components/devis/ligne-devis-form'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

function NouveauDevisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledEvenementId = searchParams.get('evenementId')
  const [loading, setLoading] = useState(false)
  const [evenements, setEvenements] = useState<Array<{ id: string; nom: string; client?: { raisonSociale: string } | null }>>([])
  const [evenementId, setEvenementId] = useState(prefilledEvenementId || '')
  const [lignes, setLignes] = useState<Ligne[]>([])

  useEffect(() => {
    getEvenements().then((evs) => setEvenements(evs.map((e) => ({
      id: e.id,
      nom: e.nom,
      client: e.client,
    }))))
  }, [])

  const handleLignesChange = useCallback((l: Ligne[]) => {
    setLignes(l)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const devis = await createDevis({
        evenementId: evenementId && evenementId !== '_none' ? evenementId : undefined,
        objet: formData.get('objet') as string || undefined,
        dateValidite: formData.get('dateValidite') as string || undefined,
        notes: formData.get('notes') as string || undefined,
        conditionsPaiement: formData.get('conditionsPaiement') as string || undefined,
        lignes: lignes.filter((l) => l.description.trim()),
      })
      router.push(`/devis/${devis.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Événement associé</Label>
              <Select value={evenementId} onValueChange={setEvenementId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Aucun événement</SelectItem>
                  {evenements.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.nom} {ev.client ? `(${ev.client.raisonSociale})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objet">Objet du devis</Label>
              <Input id="objet" name="objet" placeholder="Organisation de l'événement..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateValidite">Date de validité</Label>
              <Input id="dateValidite" name="dateValidite" type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lignes du devis</CardTitle></CardHeader>
          <CardContent>
            <LignesDevisForm onChange={handleLignesChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Conditions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditionsPaiement">Conditions de paiement</Label>
              <Input id="conditionsPaiement" name="conditionsPaiement" placeholder="30 jours à réception de facture" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Informations complémentaires..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/devis">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Créer le devis'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function NouveauDevisPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/devis">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>

      <Suspense fallback={<div className="text-gray-400">Chargement...</div>}>
        <NouveauDevisForm />
      </Suspense>
    </div>
  )
}
