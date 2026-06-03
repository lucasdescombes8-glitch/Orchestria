import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Dynamic import to avoid Edge Runtime issues
        const { prisma } = await import('@/lib/prisma')
        const bcrypt = await import('bcryptjs')

        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.actif) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.motDePasseHash
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          organisationId: user.organisationId,
          role: user.role,
        }
      },
    }),
  ],
})
