'use client'

import { useState } from 'react'
import { addTypePrestataire, deleteTypePrestataire } from '@/actions/types-prestataire'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TypeRow {
  id: string
  nom: string
}

export function TypesPrestatairManager({ types }: { types: TypeRow[] }) {
  const [newType, setNewType] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAdd() {
    const nom = newType.trim()
    if (!nom) return
    setLoading(true)
    try {
      await addTypePrestataire(nom)
      setNewType('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteTypePrestataire(id)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <span key={t.id} className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5 text-sm font-medium">
            {t.nom}
            <button
              onClick={() => handleDelete(t.id)}
              className="text-amber-400 hover:text-amber-700 transition-colors ml-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 max-w-sm">
        <Input
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          placeholder="Nouveau type (ex: DJ, Sécurité...)"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={loading || !newType.trim()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>
    </div>
  )
}
