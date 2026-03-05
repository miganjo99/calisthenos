import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  
    const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect("/login")
  }

  async function logout() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full bg-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300"></div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Hola, {user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <form action={logout}>
            <button type="submit" className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-black">
            <h3 className="text-lg font-semibold text-gray-700">Días Entrenados</h3>
            <p className="text-3xl font-bold mt-2">{user.daysTrained}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-black">
            <h3 className="text-lg font-semibold text-gray-700">Próxima Reserva</h3>
            <p className="text-gray-500 mt-2">Aún no tienes reservas activas.</p>
          </div>
        </div>

      </div>
    </div>
  )
}