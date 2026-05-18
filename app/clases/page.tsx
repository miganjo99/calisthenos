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
      <div className="min-h-[calc(100vh-56px)] bg-canvas flex items-center justify-center p-4">
        <div className="bg-soft-cloud p-12 text-center max-w-md w-full flex flex-col items-center">
          <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink mb-4">Suscripción Inactiva</h1>
          <p className="text-body-md text-charcoal mb-8">
            Para poder reservar tus clases y acceder al Open Gym, necesitas una suscripción activa.
          </p>
          
          <form action={createCheckoutSession} className="w-full">
            <button type="submit" className="button-primary w-full mb-6">
              Activar mi Suscripción
            </button>
          </form>

          <a href="/dashboard" className="text-link-md text-ink uppercase tracking-wider hover:opacity-70">
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
    <div className="min-h-[calc(100vh-56px)] bg-canvas py-section">
      <ClasesUI clases={clases} userId={user.id} />
    </div>
  )
}