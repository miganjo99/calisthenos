import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { cancelReservation } from "@/actions/reserve"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  // 1. Buscamos al usuario Y SUS RESERVAS FUTURAS
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      reservations: {
        where: {
          class: {
            date: { gte: new Date() } // Solo clases de hoy en adelante
          }
        },
        include: {
          class: true,     // Traemos los datos de la clase (la hora)
          training: true   // <-- AHORA EL ENTRENAMIENTO CUELGA DIRECTAMENTE DE LA RESERVA
        },
        orderBy: {
          class: { date: 'asc' }
        }
      }
    }
  })

  if (!user) redirect("/login")

  async function logout() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera del Perfil */}
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

        {/* Tarjetas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-black">
            <h3 className="text-lg font-semibold text-gray-700">Días Entrenados</h3>
            <p className="text-3xl font-bold mt-2">{user.daysTrained}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-black">
            <h3 className="text-lg font-semibold text-gray-700">Tus Reservas Activas</h3>
            <p className="text-3xl font-bold mt-2">{user.reservations.length}</p>
          </div>
        </div>

        {/* Lista de Próximas Clases */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Próximas Clases</h2>
          
          {user.reservations.length > 0 ? (
            <div className="space-y-4">
              {user.reservations.map((res) => {
                // Truco Fullstack: Envolvemos la acción para que TypeScript no se queje
                const cancelAction = async () => {
                  "use server"
                  await cancelReservation(res.id)
                }

                return (
                  <div key={res.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      {/* AHORA LEEMOS res.training.name en lugar de res.class.training.name */}
                      <p className="font-bold text-lg">{res.training.name}</p>
                      <p className="text-gray-600">
                        {res.class.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {res.class.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        Confirmada
                      </span>
                      
                      <form action={cancelAction}>
                        <button type="submit" className="text-red-500 hover:text-red-700 font-medium text-sm underline transition">
                          Cancelar reserva
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aún no tienes reservas activas. ¡Anímate a entrenar!</p>
          )}
          
          <div className="mt-6 text-center">
            <a href="/clases" className="inline-block bg-black text-white font-bold py-2 px-6 rounded-md hover:bg-gray-800 transition">
              Ver horarios y reservar
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}