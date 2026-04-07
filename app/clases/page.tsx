import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClasesUI from "./ClasesUI"
import { createCheckoutSession } from "@/actions/stripe"

export default async function ClasesPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  if (!user.isActive) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border-t-4 border-blue-600">
          <span className="text-6xl mb-4 block">💳</span>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Suscripción Inactiva</h1>
          <p className="text-gray-600 mb-6 font-medium">
            Para poder reservar tus clases y acceder al Open Gym, necesitas una suscripción activa.
          </p>
          
          <form action={createCheckoutSession}>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-xl hover:-translate-y-1 transform mb-4 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              Activar mi Suscripción
            </button>
          </form>

          <a href="/dashboard" className="text-gray-500 hover:text-black font-medium transition underline underline-offset-4">
            Volver a mi perfil
          </a>
        </div>
      </div>
    )
  }

  const clases = await prisma.class.findMany({
    where: { date: { gte: new Date() } },
    include: { reservations: true },
    orderBy: { date: 'asc' } 
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ClasesUI clases={clases} userId={user.id} />
    </div>
  )
}