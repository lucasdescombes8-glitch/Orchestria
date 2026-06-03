'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTache } from '@/actions/taches'
import { getEvenements } from '@/actions/evenements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function NewTacheDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [evenements, setEvenements] = useState<Array<{ id: string; nom: string }>>([])
  const [statut, setStatut] = useState('A_FAIRE')
  const [priorite, setPriorite] = useState('NORMALE')
  const [evenementId, setEvenementId] = useState('')

  useEffect(() => {
    if (open) {
      getEvenements().then((evs) => setEvenements(evs.map((e) => ({ id: e.id, nom: e.nom }))))
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      await createTache({
        titre: formData.get('titre') as string,
        description: formData.get('description') as string || undefined,
        statut,
        priorite,
        dueDate: formData.get('dueDate') as string || undefined,
        evenementId: evenementId && evenementId !== '_none' ? evenementId : undefined,
      })
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titre">Titre *</Label>
            <Input id="titre" name="titre" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priorite} onValueChange={setPriorite}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASSE">Basse</SelectItem>
                  <SelectItem value="NORMALE">Normale</SelectItem>
                  <SelectItem value="HAUTE">Haute</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_FAIRE">À faire</SelectItem>
                  <SelectItem value="EN_COURS">En cours</SelectItem>
                  <SelectItem value="TERMINEE">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d&apos;échéance</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label>Événement associé</Label>
            <Select value={evenementId} onValueChange={setEvenementId}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Aucun événement</SelectItem>
                {evenements.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
