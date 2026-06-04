'use client'

import { useState } from 'react'
import { updateMotDePasse } from '@/actions/profil'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, CheckCircle2 } from 'lucide-react'

export function PasswordForm() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    const current = fd.get('current') as string
    const next = fd.get('new') as string
    const confirm = fd.get('confirm') as string

    if (next !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }
    if (next.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    try {
      await updateMotDePasse(current, next)
      setSaved(true)
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current">Mot de passe actuel</Label>
        <Input id="current" name="current" type="password" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="new">Nouveau mot de passe</Label>
          <Input id="new" name="new" type="password" required placeholder="8 caractères min." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer</Label>
          <Input id="confirm" name="confirm" type="password" required />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <a href="/forgot-password" className="text-sm text-gray-400 hover:text-[#C41230] transition-colors">
          Mot de passe oublié ?
        </a>
        <Button type="submit" disabled={loading}>
          {saved ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> : <Lock className="h-4 w-4 mr-2" />}
          {saved ? 'Modifié !' : loading ? 'Modification...' : 'Changer le mot de passe'}
        </Button>
      </div>
    </form>
  )
}
