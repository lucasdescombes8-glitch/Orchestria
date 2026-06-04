'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, createContact } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Search, Loader2, CheckCircle2, AlertCircle, Building2, Wrench, UserPlus, ChevronDown } from 'lucide-react'
import { PrestataireTypeSelect } from '@/components/shared/prestataire-type-select'
import Link from 'next/link'

interface PappersResult {
  raisonSociale: string
  siret: string
  formeJuridique: string
  adresse: string
  codePostal: string
  ville: string
  secteur: string
  email: string
  telephone: string
}

const DEFAULT_TYPES = ['Traiteur', 'Photographe', 'Technique', 'Photobooth', 'Fleuriste', 'Piano', 'Autre']

export function NouveauClientForm({ typesPrestataire = DEFAULT_TYPES }: { typesPrestataire?: string[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [siretLoading, setSiretLoading] = useState(false)
  const [siretStatus, setSiretStatus] = useState<'idle' | 'found' | 'error'>('idle')
  const [siretError, setSiretError] = useState('')
  const [typeEntreprise, setTypeEntreprise] = useState<'CLIENT' | 'PRESTATAIRE'>('CLIENT')
  const [typePrestataire, setTypePrestataire] = useState('')
  const [showContact, setShowContact] = useState(false)
  const [contact, setContact] = useState({ prenom: '', nom: '', poste: '', email: '', telephone: '', mobile: '' })
  const [fields, setFields] = useState({
    raisonSociale: '',
    siret: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    secteur: '',
    notes: '',
  })
  const siretTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))

    if (name === 'siret') {
      const digits = value.replace(/\s/g, '')
      setSiretStatus('idle')
      setSiretError('')
      if (siretTimerRef.current) clearTimeout(siretTimerRef.current)
      if (digits.length === 14) {
        siretTimerRef.current = setTimeout(() => lookupSiret(digits), 600)
      }
    }
  }

  async function lookupSiret(siret: string) {
    setSiretLoading(true)
    setSiretStatus('idle')
    setSiretError('')
    try {
      const res = await fetch(`/api/pappers?siret=${siret}`)
      const data = await res.json()
      if (!res.ok) {
        setSiretStatus('error')
        setSiretError(data.error ?? 'Entreprise introuvable')
        return
      }
      const result = data as PappersResult
      setFields((prev) => ({
        ...prev,
        raisonSociale: result.raisonSociale || prev.raisonSociale,
        email: result.email || prev.email,
        telephone: result.telephone || prev.telephone,
        adresse: result.adresse || prev.adresse,
        codePostal: result.codePostal || prev.codePostal,
        ville: result.ville || prev.ville,
        secteur: result.secteur || prev.secteur,
      }))
      setSiretStatus('found')
    } catch {
      setSiretStatus('error')
      setSiretError('Erreur de connexion à Pappers')
    } finally {
      setSiretLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const client = await createClient({
        raisonSociale: fields.raisonSociale,
        siret: fields.siret || undefined,
        email: fields.email || undefined,
        telephone: fields.telephone || undefined,
        adresse: fields.adresse || undefined,
        codePostal: fields.codePostal || undefined,
        ville: fields.ville || undefined,
        secteur: fields.secteur || undefined,
        notes: fields.notes || undefined,
        typeEntreprise,
        typePrestataire: typeEntreprise === 'PRESTATAIRE' ? typePrestataire || undefined : undefined,
      })
      if (showContact && contact.nom.trim()) {
        await createContact(client.id, {
          prenom: contact.prenom || '',
          nom: contact.nom,
          poste: contact.poste || undefined,
          email: contact.email || undefined,
          telephone: contact.telephone || undefined,
          mobile: contact.mobile || undefined,
        })
      }
      router.push('/clients')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvelle entreprise <span className="text-[#C41230]">/</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Type d'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Type d&apos;entreprise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTypeEntreprise('CLIENT')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    typeEntreprise === 'CLIENT'
                      ? 'border-[#C41230] bg-[#FDF2F4]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className={`h-5 w-5 ${typeEntreprise === 'CLIENT' ? 'text-[#C41230]' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-semibold text-sm ${typeEntreprise === 'CLIENT' ? 'text-[#C41230]' : 'text-gray-700'}`}>Client</p>
                    <p className="text-xs text-gray-400">Entreprise cliente</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeEntreprise('PRESTATAIRE')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    typeEntreprise === 'PRESTATAIRE'
                      ? 'border-[#C41230] bg-[#FDF2F4]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wrench className={`h-5 w-5 ${typeEntreprise === 'PRESTATAIRE' ? 'text-[#C41230]' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-semibold text-sm ${typeEntreprise === 'PRESTATAIRE' ? 'text-[#C41230]' : 'text-gray-700'}`}>Prestataire</p>
                    <p className="text-xs text-gray-400">Fournisseur de services</p>
                  </div>
                </button>
              </div>
              {typeEntreprise === 'PRESTATAIRE' && (
                <div className="mt-4 space-y-2">
                  <Label>Type de prestataire</Label>
                  <PrestataireTypeSelect types={typesPrestataire} value={typePrestataire} onChange={setTypePrestataire} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Recherche automatique par SIRET
                <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                  <img src="https://www.pappers.fr/favicon.ico" className="h-3 w-3" alt="" />
                  via Pappers
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="siret">SIRET <span className="text-gray-400 font-normal">(14 chiffres — remplit le formulaire automatiquement)</span></Label>
              <div className="relative">
                <Input
                  id="siret"
                  name="siret"
                  value={fields.siret}
                  onChange={handleChange}
                  placeholder="12345678901234"
                  maxLength={14}
                  className={
                    siretStatus === 'found' ? 'border-green-400 pr-10' :
                    siretStatus === 'error' ? 'border-red-400 pr-10' : 'pr-10'
                  }
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {siretLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  {!siretLoading && siretStatus === 'found' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {!siretLoading && siretStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {!siretLoading && siretStatus === 'idle' && <Search className="h-4 w-4 text-gray-300" />}
                </div>
              </div>
              {siretStatus === 'found' && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Entreprise trouvée — champs remplis automatiquement
                </p>
              )}
              {siretStatus === 'error' && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {siretError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raisonSociale">Raison sociale *</Label>
                <Input
                  id="raisonSociale"
                  name="raisonSociale"
                  value={fields.raisonSociale}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={fields.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" name="telephone" value={fields.telephone} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secteur">Secteur d&apos;activité</Label>
                <Input
                  id="secteur"
                  name="secteur"
                  value={fields.secteur}
                  onChange={handleChange}
                  placeholder="Industrie, Services, Événementiel..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" name="adresse" value={fields.adresse} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codePostal">Code postal</Label>
                  <Input id="codePostal" name="codePostal" value={fields.codePostal} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville</Label>
                  <Input id="ville" name="ville" value={fields.ville} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                value={fields.notes}
                onChange={handleChange}
                placeholder="Informations complémentaires..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Contact optionnel */}
          <Card>
            <CardHeader>
              <button
                type="button"
                onClick={() => setShowContact((v) => !v)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-[#C41230]" />
                  Ajouter un contact
                  <span className="text-xs font-normal text-gray-400">(optionnel)</span>
                </CardTitle>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showContact ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {showContact && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={contact.prenom}
                      onChange={(e) => setContact((c) => ({ ...c, prenom: e.target.value }))}
                      placeholder="Jean"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={contact.nom}
                      onChange={(e) => setContact((c) => ({ ...c, nom: e.target.value }))}
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Poste</Label>
                  <Input
                    value={contact.poste}
                    onChange={(e) => setContact((c) => ({ ...c, poste: e.target.value }))}
                    placeholder="Directeur commercial, Chargé d'événements..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={contact.telephone}
                      onChange={(e) => setContact((c) => ({ ...c, telephone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input
                    value={contact.mobile}
                    onChange={(e) => setContact((c) => ({ ...c, mobile: e.target.value }))}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/clients">
              <Button variant="outline" type="button">Annuler</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
