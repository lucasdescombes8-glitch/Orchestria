import { getClients } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SortableHeader } from '@/components/shared/sortable-header'
import { Plus, Search, Building2, Wrench, Mail, Phone, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; order?: string; type?: string }>
}) {
  const params = await searchParams
  const sort = params.sort ?? 'raisonSociale'
  const order = params.order ?? 'asc'
  const typeFilter = params.type
  const allClients = await getClients(params.search)

  const filteredClients = typeFilter
    ? allClients.filter((c) => (c as any).typeEntreprise === typeFilter)
    : allClients

  const clients = [...filteredClients].sort((a, b) => {
    let va: any, vb: any
    if (sort === 'raisonSociale') { va = a.raisonSociale; vb = b.raisonSociale }
    else if (sort === 'ville') { va = a.ville ?? ''; vb = b.ville ?? '' }
    else if (sort === 'projets') { va = a._count.evenements; vb = b._count.evenements }
    else { va = a.raisonSociale; vb = b.raisonSociale }
    if (va < vb) return order === 'asc' ? -1 : 1
    if (va > vb) return order === 'asc' ? 1 : -1
    return 0
  })

  const sp = { search: params.search, sort: params.sort, order: params.order, type: params.type }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entreprises<span className="text-[#C41230]"> /</span></h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} entreprise{clients.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/clients/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entreprise
          </Button>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <form>
            <Input
              name="search"
              placeholder="Rechercher une entreprise..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients${params.search ? `?search=${params.search}` : ''}`}>
            <Button variant={!typeFilter ? 'default' : 'outline'} size="sm">Tous</Button>
          </Link>
          <Link href={`/clients?type=CLIENT${params.search ? `&search=${params.search}` : ''}`}>
            <Button variant={typeFilter === 'CLIENT' ? 'default' : 'outline'} size="sm">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />Clients
            </Button>
          </Link>
          <Link href={`/clients?type=PRESTATAIRE${params.search ? `&search=${params.search}` : ''}`}>
            <Button variant={typeFilter === 'PRESTATAIRE' ? 'default' : 'outline'} size="sm">
              <Wrench className="h-3.5 w-3.5 mr-1.5" />Prestataires
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of cards */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium">Aucune entreprise trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#C41230]/20 transition-all duration-200 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#FDF2F4] to-[#FBE4E8] flex items-center justify-center shrink-0 group-hover:from-[#C41230] group-hover:to-[#9B0E25] transition-all duration-200">
                    <Building2 className="h-5 w-5 text-[#C41230] group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-[#C41230] transition-colors">{client.raisonSociale}</p>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-0.5 group-hover:text-[#C41230] transition-colors" />
                    </div>
                    {client.siret && <p className="text-xs text-gray-400 mt-0.5">SIRET: {client.siret}</p>}
                    <div className="mt-3 space-y-1.5">
                      {client.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="h-3 w-3 shrink-0" />
                          {client.telephone}
                        </div>
                      )}
                      {(client.ville || client.codePostal) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {[client.codePostal, client.ville].filter(Boolean).join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(client as any).typeEntreprise === 'PRESTATAIRE' ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                        <Wrench className="h-2.5 w-2.5 mr-1" />
                        {(client as any).typePrestataire || 'Prestataire'}
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                        <Building2 className="h-2.5 w-2.5 mr-1" />
                        Client
                      </Badge>
                    )}
                    {client.secteur && <Badge variant="secondary">{client.secteur}</Badge>}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {client._count.evenements} projet{client._count.evenements > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
