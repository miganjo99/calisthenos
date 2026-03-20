'use client'

import { useState } from "react"
import Link from "next/link"

interface NavbarClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  logoutAction: () => void;
}

export default function NavbarClient({ isLoggedIn, isAdmin, logoutAction }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Función para cerrar el menú al hacer clic en un enlace en el móvil
  const closeMenu = () => setIsOpen(false)

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" onClick={closeMenu} className="font-black text-xl tracking-tight hover:text-gray-300 transition">
              Calisthenos
            </Link>
          </div>

          {/* BOTÓN HAMBURGUESA (Móvil) */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 focus:outline-none"
            >
              <svg className="h-7 w-7 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* MENÚ DESKTOP (Pantallas grandes) */}
          <div className="hidden sm:flex items-center gap-6">
            {isLoggedIn ? (
              <>
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
                <form action={logoutAction}>
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

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="sm:hidden bg-gray-900 border-t border-gray-800 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-3 flex flex-col">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="block px-3 py-2 rounded-md font-bold text-yellow-400 hover:bg-gray-800 transition">
                    Panel Admin
                  </Link>
                )}
                <Link href="/clases" onClick={closeMenu} className="block px-3 py-2 rounded-md font-medium text-gray-200 hover:bg-gray-800 transition">
                  Horarios
                </Link>
                <Link href="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md font-medium text-gray-200 hover:bg-gray-800 transition">
                  Mi Perfil
                </Link>
                <form action={logoutAction} className="pt-2">
                  <button type="submit" className="w-full text-left px-3 py-2 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition">
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="block px-3 py-2 rounded-md font-medium text-gray-200 hover:bg-gray-800 transition">
                  Entrar
                </Link>
                <Link href="/register" onClick={closeMenu} className="block w-full text-center mt-2 px-3 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition">
                  Unirse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}