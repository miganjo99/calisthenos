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

  const closeMenu = () => setIsOpen(false)

  return (
    <nav className="bg-canvas text-ink sticky top-0 z-50 border-b border-hairline">
      {/* Utility Bar (Optional, keeping it simple inside main nav for now) */}
      
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* HAMBURGER (Mobile Left) */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink p-2 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center justify-center sm:justify-start flex-1 sm:flex-none">
            <Link href="/" onClick={closeMenu} className="font-display font-black text-2xl uppercase tracking-tighter hover:opacity-70 transition">
              Calisthenos
            </Link>
          </div>

          {/* DESKTOP CENTER/RIGHT NAV */}
          <div className="hidden sm:flex items-center gap-6 text-body-strong">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="hover:underline">
                    Admin
                  </Link>
                )}
                <Link href="/clases" className="hover:underline">
                  Horarios
                </Link>
                <Link href="/ranking" className="hover:underline">
                  Ranking
                </Link>
                <Link href="/dashboard" className="hover:underline">
                  Perfil
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="button-secondary !h-10 !px-6 !text-sm">
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/clases" className="hover:underline">
                  Horarios
                </Link>
                <Link href="/ranking" className="hover:underline">
                  Ranking
                </Link>
                <Link href="/login" className="hover:underline">
                  Entrar
                </Link>
                <Link href="/register" className="button-primary !h-10 !px-6 !text-sm">
                  Unirse
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile spacer for symmetry if needed, or search icon */}
          <div className="sm:hidden flex items-center w-10"></div>

        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="sm:hidden bg-canvas border-t border-hairline absolute w-full h-screen">
          <div className="px-6 pt-6 pb-6 space-y-6 flex flex-col text-heading-lg">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="block">
                    Admin
                  </Link>
                )}
                <Link href="/clases" onClick={closeMenu} className="block">
                  Horarios
                </Link>
                <Link href="/ranking" onClick={closeMenu} className="block">
                  Ranking
                </Link>
                <Link href="/dashboard" onClick={closeMenu} className="block">
                  Mi Perfil
                </Link>
                <form action={logoutAction} className="pt-6 border-t border-hairline">
                  <button type="submit" className="w-full text-left button-secondary justify-start px-0 bg-transparent hover:bg-transparent text-sale">
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/clases" onClick={closeMenu} className="block">
                  Horarios
                </Link>
                <Link href="/ranking" onClick={closeMenu} className="block">
                  Ranking
                </Link>
                <div className="pt-6 border-t border-hairline flex flex-col gap-4">
                  <Link href="/login" onClick={closeMenu} className="button-secondary w-full">
                    Entrar
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="button-primary w-full">
                    Unirse
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}