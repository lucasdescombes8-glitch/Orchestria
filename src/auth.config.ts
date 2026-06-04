import type { NextAuthConfig } from 'next-auth'

// This config is safe for Edge Runtime (no Node.js/Prisma imports)
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname === '/login'

      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
        return true
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl))
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.organisationId = (user as any).organisationId
        token.role = (user as any).role
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.email) token.email = session.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).organisationId = token.organisationId
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
}
