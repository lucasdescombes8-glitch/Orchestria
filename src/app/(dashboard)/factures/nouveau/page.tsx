'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createFacture } from '@/actions/factures'
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

function NouvelleFactureForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [evenements, setEvenements] = useState<Array<{ id: string; nom: string; client?: { raisonSociale: string } | null }>>([])
  const [evenementId, setEvenementId] = useState('')
  const [lignes, setLignes] = useState<Ligne[]>([])

  useEffect(() => {
    getEvenements().then((evs) => setEvenements(evs.map((e) => ({
      id: e.id,
      nom: e.nom,
      client: e.client,
    }))))
  }, [])

  const handleLignesChange = useCallback((l: Ligne[]) => setLignes(l), [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const facture = await createFacture({
        evenementId: evenementId && evenementId !== '_none' ? evenementId : undefined,
        objet: formData.get('objet') as string || undefined,
        dateEcheance: formData.get('dateEcheance') as string || undefined,
        notes: formData.get('notes') as string || undefined,
        lignes: lignes.filter((l) => l.description.trim()),
      })
      router.push(`/factures/${facture.id}`)
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
              <Label htmlFor="objet">Objet</Label>
              <Input id="objet" name="objet" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEcheance">Date d&apos;échéance</Label>
              <Input id="dateEcheance" name="dateEcheance" type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lignes</CardTitle></CardHeader>
          <CardContent>
            <LignesDevisForm onChange={handleLignesChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea id="notes" name="notes" rows={3} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/factures">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Création...' : 'Créer la facture'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function NouvelleFacturePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/factures">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
      </div>
      <Suspense fallback={<div className="text-gray-400">Chargement...</div>}>
        <NouvelleFactureForm />
      </Suspense>
    </div>
  )
}
