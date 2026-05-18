import prisma from "@/lib/prisma"

export default async function RankingWidget() {
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
    <div className="bg-canvas border-t border-hairline py-6">
      <div className="mb-6 px-4">
        <h2 className="text-heading-lg font-display text-ink uppercase tracking-tighter">
          Muro de la Fama
        </h2>
      </div>

      {topUsers.length > 0 ? (
        <ul className="flex flex-col">
          {topUsers.map((user, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;

            return (
              <li key={user.id} className="flex items-center justify-between py-4 px-4 border-b border-hairline hover:bg-soft-cloud transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center">
                    <span className={`text-body-strong font-display ${isTop3 ? 'text-ink' : 'text-stone'}`}>
                      {rank}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-sm object-cover bg-soft-cloud" />
                    ) : (
                      <div className="w-8 h-8 rounded-sm bg-soft-cloud flex items-center justify-center text-ink text-body-strong font-display uppercase">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-body-strong text-ink uppercase leading-none">{user.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-heading-md font-display text-ink leading-none">{user.daysTrained}</p>
                  <p className="text-utility-xs text-mute uppercase mt-1">Entrenos</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="py-8 px-4 text-center bg-soft-cloud mt-4">
          <p className="text-body-md text-charcoal">Aún no hay atletas en el podio.</p>
        </div>
      )}
    </div>
  )
}