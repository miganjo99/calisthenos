import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { cancelReservation } from "@/actions/reserve"
import SessionRefresher from "@/components/SessionRefresher"
import RankingWidget from "@/components/RankingWidget" 

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      reservations: {
        where: {
          class: {
            date: { gte: new Date() } 
          }
        },
        include: {
          class: true,     
          training: true   
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
    <div className="bg-canvas text-ink py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <SessionRefresher />
      <div className="max-w-6xl mx-auto space-y-section">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-hairline pb-section gap-6">
          <div className="flex items-center gap-6">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-none bg-soft-cloud object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-none bg-soft-cloud flex items-center justify-center text-heading-xl font-display uppercase">
                {user.name.charAt(0)}
              </div>
            )}
            
            <div>
              <h1 className="text-heading-xl font-display uppercase tracking-tighter">Hola, {user.name}</h1>
              <p className="text-body-md text-charcoal">{user.email}</p>
            </div>
          </div>

          <form action={logout}>
            <button type="submit" className="button-secondary text-sale">
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-2">Días Entrenados</h3>
            <p className="text-display-campaign font-display uppercase">{user.daysTrained}</p>
          </div>
          
          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-2">Reservas Activas</h3>
            <p className="text-display-campaign font-display uppercase">{user.reservations.length}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-heading-xl font-display uppercase border-b border-hairline pb-4 mb-4">Mis Próximas Clases</h2>
              
              {user.reservations.length > 0 ? (
                <div>
                  {user.reservations.map((res) => {
                    const cancelAction = async () => {
                      "use server"
                      await cancelReservation(res.id)
                    }

                    return (
                      <div key={res.id} className="pdp-disclosure-row flex flex-col md:flex-row justify-between items-start md:items-center px-4 hover:bg-soft-cloud transition-colors">
                        <div>
                          <p className="text-body-strong uppercase">{res.training.name}</p>
                          <p className="text-body-md text-charcoal mt-1">
                            {res.class.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {res.class.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex items-center gap-6">
                          <span className="text-success text-caption-sm font-bold uppercase tracking-wider">
                            Confirmada
                          </span>
                          
                          <form action={cancelAction}>
                            <button type="submit" className="text-sale text-body-strong hover:underline transition">
                              Cancelar reserva
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 bg-soft-cloud mt-4 text-center">
                  <p className="text-body-md text-charcoal">Aún no tienes reservas activas.</p>
                </div>
              )}
              
              <div className="mt-8">
                <a href="/clases" className="button-primary w-full sm:w-auto">
                  Ver horarios y reservar
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <RankingWidget />
          </div>

        </div>

      </div>
    </div>
  )
}