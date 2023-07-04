import { PrismaAdapter } from "@/lib/auth/prisma_adapter"
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google"
import type { NextApiRequest, NextApiResponse, NextPageContext } from "next"

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res']
) : NextAuthOptions {
 return { 
    adapter: PrismaAdapter(req, res),

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        authorization: {
          params: {
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
          }
        },
        profile: (profile: GoogleProfile) => {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            avatar_url: profile.picture,
            username: '',
          }
        }
      })
    ],

    callbacks: {
      async signIn({ account }) {
        if(!account?.scope?.includes('https://www.googleapis.com/auth/calendar')) {
          return '/register/connect-calendar/?error=permission'
        }

        return true
      }, 

      async session({ session, user }) {
        return {
          ...session,
          user
        }
      }
    }
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res))
}

