import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      isActive: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    isActive: boolean
  }
}

import { JWT } from "next-auth/jwt"
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    isActive: boolean
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user) return null
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        
        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,         
            isActive: user.isActive, 
          }
        }
        
        return null 
      }
    })
  ],
  session: {
    strategy: "jwt", 
    maxAge: 7 * 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string 
        token.role = user.role
        token.isActive = user.isActive
      }
      
      if (trigger === "update" && session?.isActive !== undefined) {
        token.isActive = session.isActive
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isActive = token.isActive
      }
      return session
    }
  },
  pages: {
    signIn: '/login', 
  }
})