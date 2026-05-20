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
              <span className="text-heading-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-calendar-cog">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 21h-6a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5" />
                  <path d="M16 3v4" />
                  <path d="M8 3v4" />
                  <path d="M4 11h16" />
                  <path d="M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M19.001 15.5v1.5" />
                  <path d="M19.001 21v1.5" />
                  <path d="M22.032 17.25l-1.299 .75" />
                  <path d="M17.27 20l-1.3 .75" />
                  <path d="M15.97 17.25l1.3 .75" />
                  <path d="M20.733 20l1.3 .75" />
                </svg>
              </span>

              <div>
                <h3 className="text-body-strong text-ink uppercase group-hover:underline">Gestionar Clases</h3>
                <p className="text-caption-sm text-charcoal mt-1">Modifica horarios y aforos.</p>
              </div>
            </Link>

            <Link href="/admin/entrenamientos" className="p-8 border border-hairline hover:bg-soft-cloud transition-colors flex flex-col justify-between group h-full gap-4">
              <span className="text-heading-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-treadmill">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 3a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                  <path d="M3 14l4 1l.5 -.5" />
                  <path d="M12 18v-3l-3 -2.923l.75 -5.077" />
                  <path d="M6 10v-2l4 -1l2.5 2.5l2.5 .5" />
                  <path d="M21 22a1 1 0 0 0 -1 -1h-16a1 1 0 0 0 -1 1" />
                  <path d="M18 21l1 -11l2 -1" />
                </svg>
              </span>
              <div>
                <h3 className="text-body-strong text-ink uppercase group-hover:underline">Tipos de Entrenamiento</h3>
                <p className="text-caption-sm text-charcoal mt-1">Añade rutinas al Open Gym.</p>
              </div>
            </Link>

            <Link href="/admin/usuarios" className="p-8 border border-hairline hover:bg-soft-cloud transition-colors flex flex-col justify-between group h-full gap-4">
              <span className="text-heading-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </span>
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
