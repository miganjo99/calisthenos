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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Controla el acceso al gimnasio (Altas y Bajas).</p>
          </div>
          <a 
            href="/admin" 
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm sm:text-base transition"
          >
            &larr; Volver al Panel
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full border border-gray-100">
          <div className="overflow-x-auto w-full">
            
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-900 text-white text-xs sm:text-sm uppercase tracking-wide">
                  <th className="p-4 font-semibold rounded-tl-lg">Cliente</th>
                  <th className="p-4 font-semibold text-center">Estado Actual</th>
                  <th className="p-4 font-semibold text-center">Entrenos Totales</th>
                  <th className="p-4 font-semibold text-right rounded-tr-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition group">
                    
                    <td className="p-4">
                      <p className="font-bold text-gray-800 truncate max-w-[200px]" title={u.name}>{u.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px]" title={u.email}>{u.email}</p>
                    </td>
                    
                    <td className="p-4 text-center align-middle">
                      {u.isActive ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          ALTA (Activo)
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          BAJA (Inactivo)
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4 text-center align-middle">
                      <span className="text-gray-600 font-bold bg-gray-100 px-3 py-1 rounded-md">
                        {u.reservations.length}
                      </span>
                    </td>
                    
                    <td className="p-4 text-right align-middle">
                      <form action={toggleStatus}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="isActive" value={u.isActive.toString()} />
                        <button 
                          type="submit" 
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm w-[110px] whitespace-nowrap ${
                            u.isActive 
                              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white' 
                              : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white'
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
                    <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        Aún no hay clientes registrados.
                      </div>
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