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
    <div className="bg-canvas py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto space-y-section">
        
        <div className="bg-ink text-on-primary p-8 sm:p-12 flex justify-between items-center">
          <div>
            <h1 className="text-heading-xl font-display uppercase tracking-tighter">Panel de Control</h1>
            <p className="text-body-md text-stone mt-2 uppercase tracking-wider">Bienvenido, {user.name}. Tienes el control total.</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-2 uppercase">Usuarios Registrados</h3>
            <p className="text-display-campaign font-display text-ink">{totalUsers}</p>
          </div>
          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-2 uppercase">Clases Futuras</h3>
            <p className="text-display-campaign font-display text-ink">{totalClasses}</p>
          </div>
          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-2 uppercase">Ingresos Mensuales</h3>
            <p className="text-heading-xl font-display text-mute">Próximamente</p>
          </div>
        </div>

        {/* Menú de Gestión */}
        <div>
          <h2 className="text-heading-xl font-display uppercase text-ink mb-6 border-b border-hairline pb-4">Gestión del Gimnasio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
            
            <Link href="/admin/clases" className="p-8 border border-hairline hover:bg-soft-cloud transition-colors flex flex-col justify-between group h-full gap-4">
              <span className="text-heading-xl">📅</span>
              <div>
                <h3 className="text-body-strong text-ink uppercase group-hover:underline">Gestionar Clases</h3>
                <p className="text-caption-sm text-charcoal mt-1">Modifica horarios y aforos.</p>
              </div>
            </Link>

            <Link href="/admin/entrenamientos" className="p-8 border border-hairline hover:bg-soft-cloud transition-colors flex flex-col justify-between group h-full gap-4">
              <span className="text-heading-xl">💪</span>
              <div>
                <h3 className="text-body-strong text-ink uppercase group-hover:underline">Tipos de Entrenamiento</h3>
                <p className="text-caption-sm text-charcoal mt-1">Añade rutinas al Open Gym.</p>
              </div>
            </Link>

            <Link href="/admin/usuarios" className="p-8 border border-hairline hover:bg-soft-cloud transition-colors flex flex-col justify-between group h-full gap-4">
              <span className="text-heading-xl">👥</span>
              <div>
                <h3 className="text-body-strong text-ink uppercase group-hover:underline">Gestión de Clientes</h3>
                <p className="text-caption-sm text-charcoal mt-1">Controla el acceso (Altas y Bajas).</p>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  )
}