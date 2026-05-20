import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function RankingPage() {
  const topUsers = await prisma.user.findMany({
    where: { 
      role: "user", 
      isActive: true,
      daysTrained: { gt: 0 } 
    },
    orderBy: { daysTrained: 'desc' },
    take: 10
  })

  return (
    <div className="bg-canvas text-ink py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Cabecera del Ranking */}
        <div>
          <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink">
            Muro de la Fama
          </h1>
          <p className="mt-2 text-body-md text-charcoal max-w-2xl">
            Los atletas más constantes. Cada día cuenta.
          </p>
        </div>

        {/* Lista del Ranking */}
        <div className="bg-canvas border-t border-hairline">
          {topUsers.length > 0 ? (
            // console.log("Top Users:", topUsers),
            <ul>
              {topUsers.map((user, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                
                return (
                  <li key={user.id} className="pdp-disclosure-row hover:bg-soft-cloud px-4 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-8 text-center flex justify-center">
                        <span className={`text-heading-lg font-display ${isTop3 ? 'text-ink' : 'text-stone'}`}>
                          {rank}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-sm object-cover bg-soft-cloud" />
                        ) : (
                          <div className="w-12 h-12 rounded-sm bg-soft-cloud flex items-center justify-center text-ink text-heading-md font-display uppercase">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-body-strong text-ink uppercase tracking-tight">{user.name}</p>
                          <p className="text-caption-sm text-mute uppercase tracking-wider mt-1">Atleta</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-heading-xl font-display text-ink leading-none">{user.daysTrained}</p>
                      <p className="text-utility-xs text-mute uppercase mt-1">Entrenos</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="py-24 text-center">
              <h3 className="text-heading-lg text-ink uppercase font-display">El podio está vacío</h3>
              <p className="text-body-md text-charcoal mt-2">Aún no hay atletas con entrenamientos completados.</p>
            </div>
          )}
        </div>

        <div className="text-center pt-8">
          <Link href="/clases" className="button-primary">
            Sumar mi próximo entreno
          </Link>
        </div>

      </div>
    </div>
  )
}
