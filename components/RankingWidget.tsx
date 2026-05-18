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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Muro de la <span className="text-blue-600">Fama</span> 🏆
        </h2>
        <p className="text-sm text-gray-500 mt-1">Los 10 atletas más constantes</p>
      </div>

      {topUsers.length > 0 ? (
        <ul className="divide-y divide-gray-50">
          {topUsers.map((user, index) => {
            let badge = <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
            if (index === 0) badge = <span className="text-2xl" title="Oro">🥇</span>
            if (index === 1) badge = <span className="text-2xl" title="Plata">🥈</span>
            if (index === 2) badge = <span className="text-2xl" title="Bronce">🥉</span>

            return (
              <li key={user.id} className="flex items-center justify-between py-3 hover:bg-gray-50 transition px-2 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center flex justify-center">
                    {badge}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                      <p className="text-xs text-gray-500 font-medium">Atleta</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-black text-blue-600 leading-none">{user.daysTrained}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Entrenos</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <span className="text-4xl mb-2 block">🏋️‍♂️</span>
          <p className="text-gray-500 text-sm font-medium">Aún no hay atletas en el podio.</p>
        </div>
      )}
    </div>
  )
}