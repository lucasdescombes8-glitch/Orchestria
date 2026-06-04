import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { SortableHeader } from '@/components/shared/sortable-header'
import { Mail, Phone, Users, Building2 } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

interface Props {
  searchParams: Promise<{ sort?: string; order?: string }>
}

export default async function ContactsPage({ searchParams }: Props) {
  const params = await searchParams
  const sort = params.sort ?? 'nom'
  const order = params.order ?? 'asc'

  const session = await auth()
  const orgId = (session?.user as any)?.organisationId

  const contacts = await prisma.contact.findMany({
    where: { client: { organisationId: orgId, deletedAt: null } },
    include: { client: { select: { id: true, raisonSociale: true } } },
    orderBy: { nom: 'asc' },
  })

  const sorted = [...contacts].sort((a, b) => {
    let va: any, vb: any
    if (sort === 'nom') { va = `${a.nom} ${a.prenom}`; vb = `${b.nom} ${b.prenom}` }
    else if (sort === 'poste') { va = a.poste ?? ''; vb = b.poste ?? '' }
    else if (sort === 'entreprise') { va = a.client.raisonSociale; vb = b.client.raisonSociale }
    else { va = a.nom; vb = b.nom }
    if (va < vb) return order === 'asc' ? -1 : 1
    if (va > vb) return order === 'asc' ? 1 : -1
    return 0
  })

  const sp = { sort: params.sort, order: params.order }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts<span className="text-[#C41230]"> /</span></h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} contact{contacts.length > 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortableHeader label="Nom" field="nom" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead><SortableHeader label="Poste" field="poste" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead><SortableHeader label="Entreprise" field="entreprise" sort={sort} order={order} searchParams={sp} /></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-20" /><p>Aucun contact</p>
                </TableCell>
              </TableRow>
            ) : sorted.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FDF2F4] to-[#FBE4E8] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#C41230]">{c.prenom?.[0]}{c.nom?.[0]}</span>
                    </div>
                    <p className="font-medium text-gray-900">{c.prenom} {c.nom}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{c.poste ?? '—'}</TableCell>
                <TableCell>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-sm text-[#C41230] hover:underline">
                      <Mail className="h-3 w-3" />{c.email}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {c.telephone && <div className="flex items-center gap-1 text-sm text-gray-600"><Phone className="h-3 w-3" />{c.telephone}</div>}
                    {c.mobile && <div className="flex items-center gap-1 text-sm text-gray-600"><Phone className="h-3 w-3" />{c.mobile}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/clients/${c.client.id}`} className="flex items-center gap-1 text-sm text-[#C41230] hover:underline">
                    <Building2 className="h-3 w-3" />{c.client.raisonSociale}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/clients/${c.client.id}`}><Button variant="ghost" size="sm">Voir</Button></Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
