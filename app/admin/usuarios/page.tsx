import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"

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
    <div className="bg-canvas py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto space-y-section">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-hairline pb-section gap-4">
          <div>
            <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink">Gestión de Clientes</h1>
            <p className="text-body-md text-charcoal mt-2">Controla el acceso al gimnasio (Altas y Bajas).</p>
          </div>
          <Link href="/admin" className="text-link-md text-ink uppercase tracking-wider hover:opacity-70">
            Volver al Panel
          </Link>
        </div>

        <div className="bg-canvas border border-hairline">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-ink text-on-primary text-utility-xs uppercase tracking-widest border-b border-hairline">
                  <th className="p-4 font-display">Cliente</th>
                  <th className="p-4 font-display text-center">Estado Actual</th>
                  <th className="p-4 font-display text-center">Entrenos Totales</th>
                  <th className="p-4 font-display text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-soft-cloud transition-colors group">
                    
                    <td className="p-4 align-middle">
                      <p className="text-body-strong text-ink uppercase tracking-tight truncate max-w-[200px]" title={u.name}>{u.name}</p>
                      <p className="text-caption-sm text-charcoal truncate max-w-[200px]" title={u.email}>{u.email}</p>
                    </td>
                    
                    <td className="p-4 text-center align-middle">
                      {u.isActive ? (
                        <span className="text-success text-utility-xs font-display uppercase tracking-widest whitespace-nowrap">
                          ALTA (Activo)
                        </span>
                      ) : (
                        <span className="text-sale text-utility-xs font-display uppercase tracking-widest whitespace-nowrap">
                          BAJA (Inactivo)
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4 text-center align-middle">
                      <span className="text-body-strong font-display text-ink uppercase">
                        {u.reservations.length}
                      </span>
                    </td>
                    
                    <td className="p-4 text-right align-middle">
                      <form action={toggleStatus}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="isActive" value={u.isActive.toString()} />
                        <button 
                          type="submit" 
                          className={`button-secondary px-4 py-2 text-utility-xs uppercase tracking-widest w-[140px] whitespace-nowrap ${
                            u.isActive 
                              ? 'text-sale border-sale hover:bg-sale hover:text-on-primary' 
                              : 'text-success border-success hover:bg-success hover:text-on-primary'
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
                    <td colSpan={4} className="p-12 text-center text-charcoal text-body-md">
                      Aún no hay clientes registrados.
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