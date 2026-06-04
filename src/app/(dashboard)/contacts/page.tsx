import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Users, Building2 } from 'lucide-react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

export default async function ContactsPage() {
  const session = await auth()
  const orgId = (session?.user as any)?.organisationId

  const contacts = await prisma.contact.findMany({
    where: {
      client: { organisationId: orgId, deletedAt: null },
    },
    include: {
      client: { select: { id: true, raisonSociale: true } },
    },
    orderBy: { nom: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts<span className="text-[#C41230]"> /</span></h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} contact(s)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Client</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Aucun contact</p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{c.prenom} {c.nom}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{c.poste ?? '—'}</TableCell>
                  <TableCell>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-sm text-[#C41230] hover:underline">
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {c.telephone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {c.telephone}
                        </div>
                      )}
                      {c.mobile && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {c.mobile}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${c.client.id}`} className="flex items-center gap-1 text-sm text-[#C41230] hover:underline">
                      <Building2 className="h-3 w-3" />
                      {c.client.raisonSociale}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${c.client.id}`}>
                      <Button variant="ghost" size="sm">Voir client</Button>
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
