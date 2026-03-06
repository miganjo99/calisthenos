import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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
      data: { capacity } // Ya no enviamos trainingId
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Tramos Horarios</h1>
            <p className="text-gray-500">Modifica el aforo o cancela horarios (Open Gym).</p>
          </div>
          <a href="/admin" className="text-blue-600 hover:underline font-medium">Volver al Panel</a>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-sm">
                  <th className="p-4 font-semibold">Fecha y Hora</th>
                  <th className="p-4 font-semibold">Plazas (Ocupadas / Total)</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    
                    {/* Fecha y Hora */}
                    <td className="p-4">
                      <p className="font-bold text-gray-800">
                        {c.date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {c.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
                      </p>
                    </td>

                    {/* Formulario de Aforo */}
                    <td className="p-4">
                      <form action={updateClass} className="flex items-center gap-4">
                        <input type="hidden" name="classId" value={c.id} />
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">{c.reservations.length} /</span>
                          <input 
                            type="number" 
                            name="capacity" 
                            defaultValue={c.capacity} 
                            min={c.reservations.length} 
                            className="border rounded-md p-2 w-20 text-sm text-center font-bold focus:ring-2 focus:ring-black outline-none"
                          />
                        </div>

                        <button type="submit" className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded hover:bg-blue-200 transition">
                          Guardar Aforo
                        </button>
                      </form>
                    </td>

                    {/* Botón de Cancelar Hora */}
                    <td className="p-4 text-right">
                      <form action={deleteClass}>
                        <input type="hidden" name="classId" value={c.id} />
                        <button 
                          type="submit" 
                          className="text-xs bg-red-100 text-red-700 font-bold px-3 py-2 rounded hover:bg-red-200 transition"
                        >
                          Eliminar Hora
                        </button>
                      </form>
                    </td>

                  </tr>
                ))}

                {clases.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
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