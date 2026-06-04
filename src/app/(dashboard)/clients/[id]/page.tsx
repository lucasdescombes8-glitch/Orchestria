import { notFound } from 'next/navigation'
import { getClient } from '@/actions/clients'
import { getTypesPrestataire } from '@/actions/types-prestataire'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatutEvenementBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Hash,
  Users, Calendar, Plus
} from 'lucide-react'
import Link from 'next/link'
import { ContactForm } from './contact-form'
import { EditClientForm } from './edit-client-form'
import { SatisfactionForm } from './satisfaction-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const [client, typesPrestataire] = await Promise.all([getClient(id), getTypesPrestataire()])

  if (!client) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#FDF2F4] flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#C41230]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.raisonSociale}</h1>
              <p className="text-sm text-gray-500">
                {client.secteur && <Badge variant="secondary" className="mr-2">{client.secteur}</Badge>}
                Entreprise depuis {formatDate(client.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/evenements/nouveau?clientId=${client.id}`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </Link>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.telephone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            {client.telephone}
          </div>
        )}
        {(client.ville || client.codePostal) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            {[client.codePostal, client.ville].filter(Boolean).join(' ')}
          </div>
        )}
        {client.siret && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="h-4 w-4 text-gray-400" />
            {client.siret}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="infos">
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({client.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="evenements">
            Projets ({client.evenements.length})
          </TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="infos" className="mt-4">
          <EditClientForm client={client} typesPrestataire={typesPrestataire} />
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-4">
          <SatisfactionForm
            clientId={client.id}
            initialSatisfaction={(client as any).satisfaction}
            initialNotes={(client as any).notesSatisfaction}
          />
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Contacts</h3>
              <ContactForm clientId={client.id} />
            </div>

            {client.contacts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucun contact pour ce client</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {client.contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {contact.prenom} {contact.nom}
                            {contact.principal && (
                              <Badge variant="secondary" className="ml-2 text-xs">Principal</Badge>
                            )}
                          </p>
                          {contact.poste && <p className="text-sm text-gray-500">{contact.poste}</p>}
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {contact.email}
                              </span>
                            )}
                            {contact.telephone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {contact.telephone}
                              </span>
                            )}
                            {contact.mobile && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {contact.mobile}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="evenements" className="mt-4">
          <div className="space-y-3">
            {client.evenements.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-400">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucun événement pour ce client</p>
                </CardContent>
              </Card>
            ) : (
              client.evenements.map((ev) => (
                <Link key={ev.id} href={`/evenements/${ev.id}`}>
                  <Card className="hover:border-[#C41230]/20 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{ev.nom}</p>
                          <p className="text-sm text-gray-500">
                            {ev.type} · {ev.lieu ?? 'Lieu non défini'} · {formatDate(ev.dateDebut)}
                          </p>
                        </div>
                        <StatutEvenementBadge statut={ev.statut} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
