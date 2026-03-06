import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"

export default async function Navbar() {
  const session = await auth()
  
  // Buscamos si el usuario actual es admin
  let isAdmin = false
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true } // Solo traemos el rol para que sea súper rápido
    })
    isAdmin = user?.role === "admin"
  }

  async function logout() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-black text-xl tracking-tight hover:text-gray-300 transition">
              Calisthenos
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {session?.user ? (
              <>
                {/* BOTÓN SECRETO: Solo aparece si isAdmin es true */}
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition">
                    Panel Admin
                  </Link>
                )}
                
                <Link href="/clases" className="text-sm font-medium hover:text-blue-400 transition">
                  Horarios
                </Link>
                <Link href="/dashboard" className="text-sm font-medium hover:text-blue-400 transition">
                  Mi Perfil
                </Link>
                <form action={logout}>
                  <button type="submit" className="bg-white text-black text-sm font-bold px-4 py-2 rounded-md hover:bg-gray-200 transition">
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-gray-300 transition">
                  Entrar
                </Link>
                <Link href="/register" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-700 transition">
                  Unirse
                </Link>
              </>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  )
}