'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClient } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Star } from 'lucide-react'

interface Props {
  clientId: string
  initialSatisfaction?: number | null
  initialNotes?: string | null
}

export function SatisfactionForm({ clientId, initialSatisfaction, initialNotes }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(initialSatisfaction ?? 0)
  const [hovered, setHovered] = useState<number>(0)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      await updateClient(clientId, {
        satisfaction: rating > 0 ? rating : null,
        notesSatisfaction: notes || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-[#C41230]" />
          Satisfaction client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Note (1 à 5 étoiles)</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <button
                type="button"
                onClick={() => setRating(0)}
                className="ml-2 text-xs text-gray-400 hover:text-gray-600 self-center"
              >
                Effacer
              </button>
            )}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-500">
              {rating === 1 ? 'Très insatisfait' :
               rating === 2 ? 'Insatisfait' :
               rating === 3 ? 'Neutre' :
               rating === 4 ? 'Satisfait' : 'Très satisfait'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notesSatisfaction">Notes de satisfaction</Label>
          <Textarea
            id="notesSatisfaction"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Retours du client, axes d'amélioration..."
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Sauvegardé !' : loading ? 'Enregistrement...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
