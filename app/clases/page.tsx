import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClasesUI from "./ClasesUI"

export default async function ClasesPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  if (!user.isActive) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border-t-4 border-red-600">
          <span className="text-6xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Cuenta Inactiva</h1>
          <p className="text-gray-600 mb-6 font-medium">
            Tu suscripción está dada de baja actualmente. Por favor, contacta con la administración del gimnasio para volver a entrenar con nosotros.
          </p>
          <a href="/dashboard" className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
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