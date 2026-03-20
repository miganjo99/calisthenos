import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function RankingPage() {
  // Traemos a los 10 mejores usuarios (activos y que no sean admin)
  const topUsers = await prisma.user.findMany({
    where: { 
      role: "user", 
      isActive: true,
      daysTrained: { gt: 0 } // Solo mostramos a los que han entrenado al menos 1 día
    },
    orderBy: { daysTrained: 'desc' },
    take: 10
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Cabecera del Ranking */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Muro de la <span className="text-blue-600">Fama</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Los atletas más constantes de CaliGym. ¡Cada día cuenta!
          </p>
        </div>

        {/* Lista del Ranking */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {topUsers.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {topUsers.map((user, index) => {
                // Asignamos medallas a los 3 primeros
                let badge = <span className="text-gray-400 font-bold text-lg">#{index + 1}</span>
                if (index === 0) badge = <span className="text-4xl" title="Oro">🥇</span>
                if (index === 1) badge = <span className="text-4xl" title="Plata">🥈</span>
                if (index === 2) badge = <span className="text-4xl" title="Bronce">🥉</span>

                return (
                  <li key={user.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-6">
                      <div className="w-12 text-center flex justify-center">
                        {badge}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full border-2 border-gray-100 object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-xl">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-lg font-bold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 font-medium">Atleta activo</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-3xl font-black text-blue-600">{user.daysTrained}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entrenos</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">🏋️‍♂️</span>
              <h3 className="text-xl font-bold text-gray-800">El podio está vacío</h3>
              <p className="text-gray-500 mt-2">Aún no hay atletas con entrenamientos completados.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/clases" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg hover:-translate-y-0.5 transform">
            Sumar mi próximo entreno
          </Link>
        </div>

      </div>
    </div>
  )
}