import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function AdminUsuariosPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!admin || admin.role !== "admin") redirect("/dashboard")

  const usuarios = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { name: 'asc' },
    include: { reservations: true }
  })

  async function toggleStatus(formData: FormData) {
    "use server"
    const userId = formData.get("userId") as string
    const isActive = formData.get("isActive") === "true" 

    
    if (isActive) {
      await prisma.reservation.deleteMany({
        where: {
          userId: userId,
          class: { date: { gte: new Date() } }
        }
      })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !isActive }
    })

    revalidatePath("/admin/usuarios")
    revalidatePath("/clases")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
            <p className="text-gray-500">Controla el acceso al gimnasio (Altas y Bajas).</p>
          </div>
          <a href="/admin" className="text-blue-600 hover:underline font-medium">Volver al Panel</a>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-sm">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Estado Actual</th>
                <th className="p-4 font-semibold">Entrenos Totales</th>
                <th className="p-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </td>
                  
                  <td className="p-4">
                    {u.isActive ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">ALTA (Activo)</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">BAJA (Inactivo)</span>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <span className="text-gray-600 font-medium">{u.reservations.length}</span>
                  </td>
                  
                  <td className="p-4 text-right">
                    <form action={toggleStatus}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="isActive" value={u.isActive.toString()} />
                      <button 
                        type="submit" 
                        className={`text-xs font-bold px-4 py-2 rounded transition shadow-sm ${
                          u.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {u.isActive ? "Dar de Baja" : "Dar de Alta"}
                      </button>
                    </form>
                  </td>

                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Aún no hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}