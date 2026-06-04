'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { resetPassword } from '@/actions/reset-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const newPassword = fd.get('password') as string
    const confirm = fd.get('confirm') as string
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    const result = await resetPassword(token, newPassword)
    setLoading(false)
    if (result.success) {
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } else {
      setError(result.error ?? 'Une erreur est survenue')
    }
  }

  if (!token) {
    return <p className="text-sm text-red-600">Lien invalide.</p>
  }

  return done ? (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <p className="text-sm text-gray-600">Mot de passe modifié avec succès ! Redirection vers la connexion...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input id="password" name="password" type="password" required placeholder="8 caractères minimum" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmer le mot de passe</Label>
        <Input id="confirm" name="confirm" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Modification...' : 'Changer le mot de passe'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#9B0E25]">
      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-[#C41230] flex items-center justify-center mb-4 shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Orchestria</h1>
          <p className="text-slate-400 mt-1">ERP/CRM pour agences événementielles</p>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Nouveau mot de passe</CardTitle>
            <CardDescription>Choisissez un nouveau mot de passe pour votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-gray-500">Chargement...</p>}>
              <ResetPasswordForm />
            </Suspense>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
