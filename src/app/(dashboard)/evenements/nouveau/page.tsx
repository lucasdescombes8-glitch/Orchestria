'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createEvenement } from '@/actions/evenements'
import { getClients, createClient, createContact } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, AlertTriangle, Plus, X, Loader2, UserPlus, Building2 } from 'lucide-react'
import Link from 'next/link'

const TYPES = [
  { value: 'CONFERENCE', label: 'Conférence' },
  { value: 'SEMINAIRE', label: 'Séminaire' },
  { value: 'GALA', label: 'Gala' },
  { value: 'TEAMBUILDING', label: 'Team Building' },
  { value: 'MARIAGE', label: 'Mariage' },
  { value: 'CONGRES', label: 'Congrès' },
  { value: 'SALON', label: 'Salon' },
  { value: 'AUTRE', label: 'Autre' },
]

const STATUTS = [
  { value: 'PROSPECTION', label: 'Opportunité' },
  { value: 'OPTION', label: 'Option' },
  { value: 'CONFIRME', label: 'Confirmé' },
  { value: 'EN_COURS', label: 'En cours' },
]

function NouvelEvenementForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledClientId = searchParams.get('clientId')
  const prefilledDate = searchParams.get('date') ?? ''
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Array<{ id: string; raisonSociale: string }>>([])
  const [type, setType] = useState('AUTRE')
  const [statut, setStatut] = useState('PROSPECTION')
  const [clientId, setClientId] = useState(prefilledClientId || '')
  const [sallesSelectionnees, setSallesSelectionnees] = useState<string[]>([])
  const [conflits, setConflits] = useState<Array<{ id: string; nom: string; statut: string; dateDebut: string | null; lieu: string | null }>>([])
  const [dateDebutValue, setDateDebutValue] = useState(prefilledDate)
  const [dateFinValue, setDateFinValue] = useState(prefilledDate)

  // Inline client creation
  const [showNewClient, setShowNewClient] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [newClient, setNewClient] = useState({ raisonSociale: '', email: '', telephone: '', ville: '' })

  // Inline contact creation
  const [showNewContact, setShowNewContact] = useState(false)
  const [creatingContact, setCreatingContact] = useState(false)
  const [newContact, setNewContact] = useState({ prenom: '', nom: '', poste: '', email: '', telephone: '' })

  function reloadClients() {
    return getClients().then((c) => setClients(c.map((cl) => ({ id: cl.id, raisonSociale: cl.raisonSociale }))))
  }

  useEffect(() => { reloadClients() }, [])

  useEffect(() => {
    if (!dateDebutValue) { setConflits([]); return }
    const params = new URLSearchParams({ dateDebut: dateDebutValue })
    if (dateFinValue) params.set('dateFin', dateFinValue)
    fetch(`/api/conflits?${params}`)
      .then((r) => r.json())
      .then((d) => setConflits(d.conflits ?? []))
      .catch(() => {})
  }, [dateDebutValue, dateFinValue])

  async function handleCreateClient() {
    if (!newClient.raisonSociale.trim()) return
    setCreatingClient(true)
    try {
      const created = await createClient({
        raisonSociale: newClient.raisonSociale,
        email: newClient.email || undefined,
        telephone: newClient.telephone || undefined,
        ville: newClient.ville || undefined,
      })
      await reloadClients()
      setClientId(created.id)
      setShowNewClient(false)
      setNewClient({ raisonSociale: '', email: '', telephone: '', ville: '' })
    } finally {
      setCreatingClient(false)
    }
  }

  async function handleCreateContact() {
    if (!clientId || clientId === '_none' || !newContact.nom.trim()) return
    setCreatingContact(true)
    try {
      await createContact(clientId, {
        prenom: newContact.prenom,
        nom: newContact.nom,
        poste: newContact.poste || undefined,
        email: newContact.email || undefined,
        telephone: newContact.telephone || undefined,
        principal: true,
      })
      setShowNewContact(false)
      setNewContact({ prenom: '', nom: '', poste: '', email: '', telephone: '' })
    } finally {
      setCreatingContact(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const ev = await createEvenement({
        nom: formData.get('nom') as string,
        type,
        statut,
        dateDebut: formData.get('dateDebut') as string || undefined,
        dateFin: formData.get('dateFin') as string || undefined,
        heureDebutMontage: formData.get('heureDebutMontage') as string || undefined,
        heureDebutEvenement: formData.get('heureDebutEvenement') as string || undefined,
        heureFinEvenement: formData.get('heureFinEvenement') as string || undefined,
        heureFinDemontage: formData.get('heureFinDemontage') as string || undefined,
        nombreParticipants: formData.get('nombreParticipants') ? Number(formData.get('nombreParticipants')) : undefined,
        budgetIndicatif: formData.get('budgetIndicatif') ? Number(formData.get('budgetIndicatif')) : undefined,
        salles: sallesSelectionnees.length > 0 ? sallesSelectionnees.join(',') : undefined,
        brief: formData.get('brief') as string || undefined,
        notes: formData.get('notes') as string || undefined,
        clientId: clientId && clientId !== '_none' ? clientId : undefined,
      })
      router.push(`/evenements/${ev.id}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === clientId)

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l&apos;événement *</Label>
              <Input id="nom" name="nom" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statut} onValueChange={setStatut}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client selector + inline creation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Entreprise</Label>
                {!showNewClient && (
                  <button
                    type="button"
                    onClick={() => { setShowNewClient(true); setClientId('_none') }}
                    className="flex items-center gap-1 text-xs text-[#C41230] hover:underline"
                  >
                    <Building2 className="h-3 w-3" /> Nouveau client
                  </button>
                )}
              </div>

              {showNewClient ? (
                <div className="border border-[#C41230]/30 rounded-xl p-4 space-y-3 bg-red-50/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">Créer une nouvelle entreprise</p>
                    <button type="button" onClick={() => setShowNewClient(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Raison sociale *</Label>
                      <Input
                        value={newClient.raisonSociale}
                        onChange={(e) => setNewClient((p) => ({ ...p, raisonSociale: e.target.value }))}
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                        placeholder="contact@entreprise.fr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Téléphone</Label>
                      <Input
                        value={newClient.telephone}
                        onChange={(e) => setNewClient((p) => ({ ...p, telephone: e.target.value }))}
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Ville</Label>
                      <Input
                        value={newClient.ville}
                        onChange={(e) => setNewClient((p) => ({ ...p, ville: e.target.value }))}
                        placeholder="Lyon, Paris..."
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateClient}
                    disabled={creatingClient || !newClient.raisonSociale.trim()}
                  >
                    {creatingClient ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Plus className="h-3 w-3 mr-1.5" />}
                    Créer l'entreprise
                  </Button>
                </div>
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une entreprise" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sans entreprise</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.raisonSociale}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Inline contact creation — shown once a client is selected */}
            {clientId && clientId !== '_none' && !showNewClient && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Contact principal</Label>
                  {!showNewContact && (
                    <button
                      type="button"
                      onClick={() => setShowNewContact(true)}
                      className="flex items-center gap-1 text-xs text-[#C41230] hover:underline"
                    >
                      <UserPlus className="h-3 w-3" /> Ajouter un contact
                    </button>
                  )}
                </div>
                {!showNewContact && (
                  <p className="text-xs text-gray-400 italic">
                    Entreprise : {selectedClient?.raisonSociale} — cliquez &quot;Ajouter un contact&quot; pour créer un interlocuteur.
                  </p>
                )}

                {showNewContact && (
                  <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">Nouveau contact pour {selectedClient?.raisonSociale}</p>
                      <button type="button" onClick={() => setShowNewContact(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Prénom</Label>
                        <Input
                          value={newContact.prenom}
                          onChange={(e) => setNewContact((p) => ({ ...p, prenom: e.target.value }))}
                          placeholder="Jean"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nom *</Label>
                        <Input
                          value={newContact.nom}
                          onChange={(e) => setNewContact((p) => ({ ...p, nom: e.target.value }))}
                          placeholder="Dupont"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Poste</Label>
                        <Input
                          value={newContact.poste}
                          onChange={(e) => setNewContact((p) => ({ ...p, poste: e.target.value }))}
                          placeholder="Directeur événementiel"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                          placeholder="jean.dupont@société.fr"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Téléphone</Label>
                        <Input
                          value={newContact.telephone}
                          onChange={(e) => setNewContact((p) => ({ ...p, telephone: e.target.value }))}
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateContact}
                      disabled={creatingContact || !newContact.nom.trim()}
                    >
                      {creatingContact ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Plus className="h-3 w-3 mr-1.5" />}
                      Créer le contact
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Dates &amp; Salles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateDebut">Date de début</Label>
                <Input id="dateDebut" name="dateDebut" type="date" value={dateDebutValue} onChange={(e) => setDateDebutValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFin">Date de fin</Label>
                <Input id="dateFin" name="dateFin" type="date" value={dateFinValue} onChange={(e) => setDateFinValue(e.target.value)} />
              </div>
            </div>
            {conflits.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Conflit de réservation détecté</p>
                  <ul className="mt-1 space-y-0.5">
                    {conflits.map((c) => (
                      <li key={c.id} className="text-xs text-orange-700">• {c.nom} ({c.statut})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Salle(s)</Label>
              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                {['Corbeille', 'Agents de change', 'Allée Rhône', 'Allée Saône', 'Lumière', 'Ampère', 'Tony Garnier', 'Jacquard', 'Coursives 1er étage'].map((salle) => (
                  <label key={salle} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={sallesSelectionnees.includes(salle)}
                      onChange={(e) => setSallesSelectionnees((prev) =>
                        e.target.checked ? [...prev, salle] : prev.filter((s) => s !== salle)
                      )}
                      className="rounded border-gray-300 text-[#C41230] focus:ring-[#C41230]"
                    />
                    <span className="text-sm text-gray-700">{salle}</span>
                  </label>
                ))}
              </div>
              {sallesSelectionnees.length > 0 && (
                <p className="text-xs text-[#C41230]">Sélectionnées : {sallesSelectionnees.join(', ')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heureDebutMontage">Début montage</Label>
                <Input id="heureDebutMontage" name="heureDebutMontage" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureDebutEvenement">Début événement</Label>
                <Input id="heureDebutEvenement" name="heureDebutEvenement" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureFinEvenement">Fin événement</Label>
                <Input id="heureFinEvenement" name="heureFinEvenement" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureFinDemontage">Fin démontage</Label>
                <Input id="heureFinDemontage" name="heureFinDemontage" type="time" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Détails</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombreParticipants">Nombre de participants</Label>
                <Input id="nombreParticipants" name="nombreParticipants" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetIndicatif">Budget indicatif (€)</Label>
                <Input id="budgetIndicatif" name="budgetIndicatif" type="number" min="0" step="0.01" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brief">Brief / Description</Label>
              <Textarea id="brief" name="brief" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/evenements">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : "Créer l'événement"}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function NouvelEvenementPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/evenements">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvel événement</h1>
      </div>
      <Suspense fallback={<div className="text-gray-400">Chargement...</div>}>
        <NouvelEvenementForm />
      </Suspense>
    </div>
  )
}
