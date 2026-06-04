'use client'

import { useState } from 'react'
import { requestPasswordReset } from '@/actions/reset-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result.success) {
      setSent(true)
    } else {
      setError(result.error ?? 'Une erreur est survenue')
    }
  }

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
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-sm text-gray-600">
                  Si cette adresse correspond à un compte, vous recevrez un email avec un lien de réinitialisation sous peu.
                </p>
                <Link href="/login" className="text-sm text-[#C41230] font-medium hover:underline flex items-center gap-1 mt-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="votre@email.fr" required autoComplete="email" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
