import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function AdminClasesPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== "admin") redirect("/dashboard")

  // 1. Traer TODAS las clases futuras (solo el tramo horario y las reservas)
  const clases = await prisma.class.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    include: {
      reservations: true
    }
  })

  // ACCIÓN DEL SERVIDOR: Actualizar la capacidad de una clase
  async function updateClass(formData: FormData) {
    "use server"
    const classId = formData.get("classId") as string
    const capacity = parseInt(formData.get("capacity") as string)

    await prisma.class.update({
      where: { id: classId },
      data: { capacity } 
    })

    revalidatePath("/admin/clases")
    revalidatePath("/clases")
  }

  // Borrar/Cancelar una clase
  async function deleteClass(formData: FormData) {
    "use server"
    const classId = formData.get("classId") as string

    // Primero borramos las reservas para evitar errores
    await prisma.reservation.deleteMany({
      where: { classId }
    })

    // Luego borramos el tramo horario
    await prisma.class.delete({
      where: { id: classId }
    })

    revalidatePath("/admin/clases")
    revalidatePath("/clases")
  }

  return (
    <div className="bg-canvas py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-hairline pb-section gap-4">
          <div>
            <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink">Gestión de Tramos Horarios</h1>
            <p className="text-body-md text-charcoal mt-2">Modifica el aforo o cancela horarios (Open Gym).</p>
          </div>
          <Link href="/admin" className="text-link-md text-ink hover:opacity-70 uppercase tracking-wider">Volver al Panel</Link>
        </div>

        <div className="bg-canvas border border-hairline">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink text-on-primary text-utility-xs uppercase tracking-widest border-b border-hairline">
                  <th className="p-4 font-display">Fecha y Hora</th>
                  <th className="p-4 font-display">Plazas (Ocupadas / Total)</th>
                  <th className="p-4 font-display text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {clases.map((c) => (
                  <tr key={c.id} className="hover:bg-soft-cloud transition-colors">
                    
                    {/* Fecha y Hora */}
                    <td className="p-4 align-middle">
                      <p className="text-body-strong text-ink uppercase">
                        {c.date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-caption-sm text-charcoal uppercase mt-1">
                        {c.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
                      </p>
                    </td>

                    {/* Formulario de Aforo */}
                    <td className="p-4 align-middle">
                      <form action={updateClass} className="flex flex-wrap items-center gap-4">
                        <input type="hidden" name="classId" value={c.id} />
                        
                        <div className="flex items-center gap-2">
                          <span className="text-body-strong text-charcoal">{c.reservations.length} /</span>
                          <input 
                            type="number" 
                            name="capacity" 
                            defaultValue={c.capacity} 
                            min={c.reservations.length} 
                            className="bg-transparent border border-hairline rounded-none p-2 w-20 text-ink text-center font-bold focus:ring-2 focus:ring-ink outline-none"
                          />
                        </div>

                        <button type="submit" className="button-secondary px-4 py-2 text-utility-xs uppercase tracking-widest">
                          Guardar Aforo
                        </button>
                      </form>
                    </td>

                    {/* Botón de Cancelar Hora */}
                    <td className="p-4 text-right align-middle">
                      <form action={deleteClass}>
                        <input type="hidden" name="classId" value={c.id} />
                        <button 
                          type="submit" 
                          className="button-secondary px-4 py-2 text-sale text-utility-xs uppercase tracking-widest hover:bg-sale hover:text-on-primary border-sale"
                        >
                          Eliminar
                        </button>
                      </form>
                    </td>

                  </tr>
                ))}

                {clases.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-charcoal text-body-md">
                      No hay horarios programados. Recuerda que se generan automáticamente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}