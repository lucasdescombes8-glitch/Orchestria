'use client'

import { useState } from 'react'
import { addTypePrestataire } from '@/actions/types-prestataire'
import { Plus, Check } from 'lucide-react'

interface Props {
  types: string[]
  value: string
  onChange: (val: string) => void
}

export function PrestataireTypeSelect({ types, value, onChange }: Props) {
  const [allTypes, setAllTypes] = useState(types)
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    const trimmed = newType.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      await addTypePrestataire(trimmed)
      setAllTypes((prev) => [...prev, trimmed])
      onChange(trimmed)
      setNewType('')
      setShowAdd(false)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-2">
      <select
        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C41230] bg-white"
        value={value}
        onChange={(e) => {
          if (e.target.value === '__add__') {
            setShowAdd(true)
          } else {
            onChange(e.target.value)
            setShowAdd(false)
          }
        }}
      >
        <option value="">— Sélectionner un type —</option>
        {allTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
        <option value="__add__">+ Ajouter un type...</option>
      </select>

      {showAdd && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } if (e.key === 'Escape') setShowAdd(false) }}
            placeholder="Nom du type..."
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C41230]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newType.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#C41230] text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {adding ? 'Ajout...' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={() => { setShowAdd(false); setNewType('') }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}
