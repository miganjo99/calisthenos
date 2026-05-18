import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { reserveClass } from "@/actions/reserve"
import Link from "next/link"

export default async function ClaseDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  const { id } = await params

  // 1. Buscamos el tramo horario y las reservas
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

  // 2. Traemos TODAS las rutinas disponibles
  const trainings = await prisma.training.findMany({
    orderBy: { name: 'asc' }
  })

  // 3. Comprobamos el estado
  const userReservation = gymClass.reservations.find(r => r.userId === user.id)
  const isReserved = !!userReservation
  const isFull = gymClass.reservations.length >= gymClass.capacity

  // 4. Nueva acción de reserva
  const reserveAction = async (formData: FormData) => {
    "use server"
    const trainingId = formData.get("trainingId") as string
    if (!trainingId) return
    await reserveClass(gymClass.id, trainingId)
  }

  return (
    <div className="bg-canvas py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Cabecera del Tramo Horario */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-hairline pb-section gap-6">
          <div>
            <span className="bg-ink text-on-primary px-3 py-1 text-utility-xs uppercase tracking-widest font-display">
              Entrenamiento Libre
            </span>
            <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink mt-4">
              {gymClass.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
            </h1>
            <p className="text-body-md text-charcoal mt-1 uppercase tracking-wider">
              {gymClass.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link href="/clases" className="text-link-md text-ink uppercase tracking-wider hover:opacity-70">Volver a horarios</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Columna Izquierda: Formulario de Reserva */}
          <div>
            <h2 className="text-heading-lg font-display uppercase text-ink mb-6 border-b border-hairline pb-4">Confirma tu asistencia</h2>
            
            <div className="mb-8">
              <p className="text-caption-sm text-mute uppercase tracking-widest mb-1">Ocupación actual</p>
              <div className="flex items-baseline gap-2">
                <span className="text-display-campaign font-display text-ink">{gymClass.reservations.length}</span>
                <span className="text-heading-md font-display text-stone">/ {gymClass.capacity}</span>
              </div>
            </div>

            <form action={reserveAction} className="space-y-8">
              {isReserved ? (
                <div className="bg-soft-cloud p-6 border-l-4 border-success">
                  <p className="text-heading-md font-display uppercase text-success mb-2 tracking-widest">¡Plaza reservada! ✓</p>
                  <p className="text-body-md text-ink">Vas a entrenar: <strong>{userReservation.training.name}</strong></p>
                </div>
              ) : isFull ? (
                <div className="bg-soft-cloud p-6 border-l-4 border-sale">
                  <p className="text-heading-md font-display uppercase text-sale tracking-widest">Este tramo horario está completo</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-body-strong text-ink mb-4 uppercase">
                      ¿Qué rutina vas a hacer hoy?
                    </label>
                    <select 
                      name="trainingId" 
                      required
                      className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-4 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition cursor-pointer appearance-none"
                    >
                      <option value="">-- Selecciona un entrenamiento --</option>
                      {trainings.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.exercises.length} ejercicios)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="button-primary w-full py-4 text-heading-md uppercase tracking-wider">
                    Confirmar Plaza y Rutina
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Columna Derecha: Compañeros y sus rutinas */}
          <div>
            <h2 className="text-heading-lg font-display uppercase text-ink mb-6 border-b border-hairline pb-4">Compañeros en esta hora</h2>
            
            {gymClass.reservations.length > 0 ? (
              <div className="divide-y divide-hairline">
                {gymClass.reservations.map((res) => (
                  <div key={res.id} className="py-4 flex items-center gap-4">
                    {res.user.avatarUrl ? (
                       <img src={res.user.avatarUrl} alt={res.user.name} className="w-12 h-12 rounded-none bg-soft-cloud object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-none bg-soft-cloud flex items-center justify-center text-ink font-display text-heading-md uppercase">
                        {res.user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-body-strong text-ink uppercase tracking-tight">{res.user.name.split(' ')[0]}</p>
                      <p className="text-caption-sm text-mute uppercase tracking-widest mt-1">
                        {res.training.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 bg-soft-cloud text-center mt-4">
                <p className="text-body-md text-charcoal">Nadie se ha apuntado aún.<br/>¡Sé el primero en abrir el gimnasio!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}