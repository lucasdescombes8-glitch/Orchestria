import { getClients } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Building2, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const clients = await getClients(params.search)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} entreprise(s)</p>
        </div>
        <Link href="/clients/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entreprise
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <form>
          <Input
            name="search"
            placeholder="Rechercher une entreprise..."
            defaultValue={params.search}
            className="pl-9"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Raison sociale</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Secteur</TableHead>
              <TableHead>Projets</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  <Building2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>aucune entreprise trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#FDF2F4] flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-[#C41230]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.raisonSociale}</p>
                        {client.siret && <p className="text-xs text-gray-400">SIRET: {client.siret}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {client.telephone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(client.ville || client.codePostal) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {[client.codePostal, client.ville].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.secteur && (
                      <Badge variant="secondary">{client.secteur}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {client._count.evenements} événement(s)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
