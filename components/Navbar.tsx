import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import NavbarClient from "./NavbarClient" 

export default async function Navbar() {
  const session = await auth()
  
  // Buscamos si el usuario actual es admin
  let isAdmin = false
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    isAdmin = user?.role === "admin"
  }

  async function logout() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  const isLoggedIn = !!session?.user

  return (
    <NavbarClient 
      isLoggedIn={isLoggedIn} 
      isAdmin={isAdmin} 
      logoutAction={logout} 
    />
  )
}