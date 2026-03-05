import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { reserveClass } from "@/actions/reserve"
import { redirect } from "next/navigation"
import { Training, Reservation, Class as PrismaClass } from "@prisma/client"

type ClaseConDetalles = PrismaClass & {
  training: Training;
  reservations: Reservation[];
};

export default async function ClasesPage() {
  // Protegemos la ruta para que solo entren usuarios registrados
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  const clases = await prisma.class.findMany({
    where: { date: { gte: new Date() } },
    include: { 
      training: true, 
      reservations: true 
    },
    orderBy: { date: 'asc' } 
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Próximas Clases</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">Volver a mi perfil</a>
        </div>
        
        <div className="grid gap-4">
          {clases.map((c: ClaseConDetalles) => {
            
            const isReserved = c.reservations.some((r: Reservation) => r.userId === user.id) 
            const isFull = c.reservations.length >= c.capacity
            // Envolvemos la acción para que TypeScript no se queje del tipo de retorno
            const reserveAction = async () => {
                "use server"
                await reserveClass(c.id)
            }

            return (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-black">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{c.training.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {c.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {c.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Plazas ocupadas: {c.reservations.length} / {c.capacity}
                  </p>
                </div>

                <form action={reserveAction}>
                  {isReserved ? (
                    <button disabled className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium cursor-not-allowed w-full md:w-auto border border-green-200">
                      Reservado ✓
                    </button>
                  ) : isFull ? (
                    <button disabled className="bg-red-100 text-red-700 px-6 py-2 rounded-lg font-medium cursor-not-allowed w-full md:w-auto border border-red-200">
                      Completo
                    </button>
                  ) : (
                    <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition w-full md:w-auto">
                      Reservar Plaza
                    </button>
                  )}
                </form>
              </div>
            )
          })}
          
          {clases.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
              No hay clases programadas por el momento.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}