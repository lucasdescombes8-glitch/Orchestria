'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'
import { formatCurrency, calculateLigne } from '@/lib/utils'

export interface Ligne {
  id?: string
  description: string
  quantite: number
  prixUnitaireHt: number
  tauxTva: number
  totalHt: number
  totalTtc: number
}

interface LignesDevisFormProps {
  initialLignes?: Ligne[]
  onChange: (lignes: Ligne[]) => void
}

export function LignesDevisForm({ initialLignes = [], onChange }: LignesDevisFormProps) {
  const [lignes, setLignes] = useState<Ligne[]>(
    initialLignes.length > 0 ? initialLignes : [
      { description: '', quantite: 1, prixUnitaireHt: 0, tauxTva: 20, totalHt: 0, totalTtc: 0 }
    ]
  )

  useEffect(() => {
    onChange(lignes)
  }, [lignes, onChange])

  function addLigne() {
    setLignes([...lignes, { description: '', quantite: 1, prixUnitaireHt: 0, tauxTva: 20, totalHt: 0, totalTtc: 0 }])
  }

  function removeLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  function updateLigne(index: number, field: keyof Ligne, value: string | number) {
    const newLignes = [...lignes]
    const ligne = { ...newLignes[index], [field]: value }
    const calc = calculateLigne(
      field === 'quantite' ? Number(value) : ligne.quantite,
      field === 'prixUnitaireHt' ? Number(value) : ligne.prixUnitaireHt,
      field === 'tauxTva' ? Number(value) : ligne.tauxTva
    )
    newLignes[index] = { ...ligne, ...calc }
    setLignes(newLignes)
  }

  const totalHt = lignes.reduce((s, l) => s + l.totalHt, 0)
  const totalTtc = lignes.reduce((s, l) => s + l.totalTtc, 0)
  const totalTva = totalTtc - totalHt

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 px-2">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-right">Qté</div>
        <div className="col-span-2 text-right">P.U. HT</div>
        <div className="col-span-1 text-right">TVA</div>
        <div className="col-span-1 text-right">Total HT</div>
        <div className="col-span-1"></div>
      </div>

      {lignes.map((ligne, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 md:col-span-5">
            <Input
              placeholder="Description de la prestation..."
              value={ligne.description}
              onChange={(e) => updateLigne(i, 'description', e.target.value)}
            />
          </div>
          <div className="col-span-4 md:col-span-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={ligne.quantite}
              onChange={(e) => updateLigne(i, 'quantite', parseFloat(e.target.value) || 0)}
              className="text-right"
            />
          </div>
          <div className="col-span-4 md:col-span-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={ligne.prixUnitaireHt}
              onChange={(e) => updateLigne(i, 'prixUnitaireHt', parseFloat(e.target.value) || 0)}
              className="text-right"
            />
          </div>
          <div className="col-span-4 md:col-span-1">
            <Select
              value={String(ligne.tauxTva)}
              onValueChange={(v) => updateLigne(i, 'tauxTva', Number(v))}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5.5">5,5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3 md:col-span-1 text-right">
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(ligne.totalHt)}
            </span>
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-600 h-8 w-8"
              onClick={() => removeLigne(i)}
              disabled={lignes.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addLigne}>
        <Plus className="h-4 w-4 mr-1" />
        Ajouter une ligne
      </Button>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total HT</span>
          <span className="font-medium">{formatCurrency(totalHt)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total TVA</span>
          <span className="font-medium">{formatCurrency(totalTva)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>Total TTC</span>
          <span className="text-indigo-600">{formatCurrency(totalTtc)}</span>
        </div>
      </div>
    </div>
  )
}
