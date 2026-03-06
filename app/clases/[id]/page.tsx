import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { reserveClass } from "@/actions/reserve"

export default async function ClaseDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  const { id } = await params

  // 1. Buscamos el tramo horario y las reservas (ahora incluyendo qué rutina eligió cada usuario)
  const gymClass = await prisma.class.findUnique({
    where: { id: id },
    include: {
      reservations: {
        include: { 
          user: true,
          training: true 
        }
      }
    }
  })

  if (!gymClass) redirect("/clases")

  // 2. Traemos TODAS las rutinas disponibles para que el usuario pueda elegir
  const trainings = await prisma.training.findMany({
    orderBy: { name: 'asc' }
  })

  // 3. Comprobamos el estado del usuario actual
  const userReservation = gymClass.reservations.find(r => r.userId === user.id)
  const isReserved = !!userReservation
  const isFull = gymClass.reservations.length >= gymClass.capacity

  // 4. Nueva acción de reserva que lee el formulario
  const reserveAction = async (formData: FormData) => {
    "use server"
    const trainingId = formData.get("trainingId") as string
    if (!trainingId) return
    // Pasamos el ID de la clase y el ID del entrenamiento elegido
    await reserveClass(gymClass.id, trainingId)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera del Tramo Horario */}
        <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
              Entrenamiento Libre
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">
              {gymClass.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
            </h1>
            <p className="text-gray-600 mt-1 text-lg">
              {gymClass.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <a href="/clases" className="text-blue-600 hover:underline font-medium">Volver a horarios</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna Izquierda: Formulario de Reserva */}
          <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-black">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Confirma tu asistencia</h2>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Ocupación actual</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-800">{gymClass.reservations.length}</span>
                <span className="text-lg text-gray-500 mb-1">/ {gymClass.capacity} plazas</span>
              </div>
            </div>

            <form action={reserveAction} className="space-y-6">
              {/* Si YA está reservado, mostramos su elección */}
              {isReserved ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="font-bold text-green-800 mb-1">¡Plaza reservada! ✓</p>
                  <p className="text-sm text-green-700">Vas a entrenar: <strong>{userReservation.training.name}</strong></p>
                </div>
              ) : isFull ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center text-red-700 font-bold">
                  Este tramo horario está completo
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ¿Qué rutina vas a hacer hoy?
                    </label>
                    <select 
                      name="trainingId" 
                      required
                      className="w-full border-gray-300 border rounded-lg p-3 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-black outline-none transition"
                    >
                      <option value="">-- Selecciona un entrenamiento --</option>
                      {trainings.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.exercises.length} ejercicios)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg">
                    Confirmar Plaza y Rutina
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Columna Derecha: Compañeros y sus rutinas */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Compañeros en esta hora</h2>
            
            {gymClass.reservations.length > 0 ? (
              <div className="space-y-4">
                {gymClass.reservations.map((res) => (
                  <div key={res.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {res.user.avatarUrl ? (
                       <img src={res.user.avatarUrl} alt={res.user.name} className="w-12 h-12 rounded-full bg-white border shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{res.user.name.split(' ')[0]}</p>
                      <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {res.training.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl">🤸‍♂️</span>
                <p className="text-gray-500 mt-4 font-medium">Nadie se ha apuntado aún.<br/>¡Sé el primero en abrir el gimnasio!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}