"use client"

import { useState } from "react"
import Link from "next/link"

function agruparClasesPorDia(clases: any[]) {
  return clases.reduce((grupos: any, clase: any) => {
    const fecha = new Date(clase.date)
    const diaString = fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', day: 'numeric', month: 'long' 
    })
    const diaFormateado = diaString.charAt(0).toUpperCase() + diaString.slice(1)

    if (!grupos[diaFormateado]) {
      grupos[diaFormateado] = []
    }
    grupos[diaFormateado].push(clase)
    return grupos
  }, {})
}

export default function ClasesUI({ clases, userId }: { clases: any[], userId: string }) {
  const clasesAgrupadas = agruparClasesPorDia(clases)
  const diasDisponibles = Object.keys(clasesAgrupadas)
  
  const [diaAbierto, setDiaAbierto] = useState<string | null>(diasDisponibles[0] || null)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Horarios Disponibles</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">Volver a mi perfil</Link>
      </div>

      {diasDisponibles.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">
          No hay clases programadas por el momento.
        </div>
      ) : (
        <div className="space-y-4">
          {diasDisponibles.map((dia) => (
            <div key={dia} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              
              <button 
                onClick={() => setDiaAbierto(diaAbierto === dia ? null : dia)}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
              >
                <h2 className="text-xl font-bold text-gray-800">{dia}</h2>
                <span className="text-2xl text-gray-400">
                  {diaAbierto === dia ? "−" : "+"}
                </span>
              </button>

              {diaAbierto === dia && (
                <div className="p-4 bg-white divide-y divide-gray-100">
                  {clasesAgrupadas[dia].map((c: any) => {
                    const isReserved = c.reservations.some((r: any) => r.userId === userId)
                    const isFull = c.reservations.length >= c.capacity
                    const hora = new Date(c.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-black text-white font-bold px-4 py-2 rounded-lg text-lg">
                            {hora}
                          </div>
                          <div>
                            {/* AHORA INDICAMOS QUE ES UN TRAMO LIBRE */}
                            <h3 className="text-lg font-bold text-gray-800">Entrenamiento a elegir</h3>
                            <p className="text-sm text-gray-500">
                              Plazas ocupadas: {c.reservations.length} / {c.capacity}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isReserved ? (
                            <span className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium border border-green-200">
                              Reservado ✓
                            </span>
                          ) : isFull ? (
                            <span className="inline-block bg-red-100 text-red-700 px-6 py-2 rounded-lg font-medium border border-red-200">
                              Completo
                            </span>
                          ) : (
                            <Link 
                              href={`/clases/${c.id}`}
                              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                              Elegir Rutina
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}