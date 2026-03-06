import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  // 1. Buscamos al usuario en la base de datos
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  })

  // solo admin
  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Recopilamos algunas estats rápidas para el jefe
  const totalUsers = await prisma.user.count()
  const totalClasses = await prisma.class.count({
    where: { date: { gte: new Date() } } // Clases futuras
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-black text-white p-8 rounded-xl shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black">Panel de Control</h1>
            <p className="text-gray-400 mt-2">Bienvenido, {user.name}. Tienes el control total.</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-700">Usuarios Registrados</h3>
            <p className="text-4xl font-bold mt-2">{totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-600">
            <h3 className="text-lg font-semibold text-gray-700">Clases Futuras</h3>
            <p className="text-4xl font-bold mt-2">{totalClasses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-purple-600">
            <h3 className="text-lg font-semibold text-gray-700">Ingresos Mensuales</h3>
            <p className="text-4xl font-bold mt-2 text-gray-400">Próximamente</p>
          </div>
        </div>

        {/* Menú de Gestión */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión del Gimnasio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Estos enlaces los iremos creando paso a paso */}
            <Link href="/admin/clases" className="p-4 border rounded-lg hover:bg-gray-50 transition flex items-center justify-between group">
              <div>
                <h3 className="font-bold text-lg group-hover:text-blue-600 transition">Gestionar Clases</h3>
                <p className="text-sm text-gray-500">Modifica horarios, capacidades o cancela clases.</p>
              </div>
              <span className="text-2xl">📅</span>
            </Link>

            <Link href="/admin/entrenamientos" className="p-4 border rounded-lg hover:bg-gray-50 transition flex items-center justify-between group">
              <div>
                <h3 className="font-bold text-lg group-hover:text-blue-600 transition">Tipos de Entrenamiento</h3>
                <p className="text-sm text-gray-500">Añade nuevos ejercicios y rutinas.</p>
              </div>
              <span className="text-2xl">💪</span>
            </Link>

          </div>
        </div>

      </div>
    </div>
  )
}