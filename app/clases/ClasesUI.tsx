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
    <div className="max-w-4xl mx-auto px-4 sm:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-section gap-4 border-b border-hairline pb-4">
        <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink">Horarios Disponibles</h1>
        <Link href="/dashboard" className="text-link-md text-ink hover:opacity-70 uppercase tracking-wider">Volver a mi perfil</Link>
      </div>

      {diasDisponibles.length === 0 ? (
        <div className="bg-soft-cloud p-12 text-center">
          <p className="text-body-md text-charcoal">No hay clases programadas por el momento.</p>
        </div>
      ) : (
        <div className="space-y-sm">
          {diasDisponibles.map((dia) => (
            <div key={dia} className="border-t border-hairline">
              
              <button 
                onClick={() => setDiaAbierto(diaAbierto === dia ? null : dia)}
                className="w-full py-6 flex justify-between items-center text-ink hover:text-charcoal transition-colors group"
              >
                <h2 className="text-heading-lg font-display uppercase">{dia}</h2>
                <span className="text-heading-lg font-display opacity-50 group-hover:opacity-100 transition-opacity">
                  {diaAbierto === dia ? "−" : "+"}
                </span>
              </button>

              {diaAbierto === dia && (
                <div className="divide-y divide-hairline border-t border-hairline border-b mb-6">
                  {clasesAgrupadas[dia].map((c: any) => {
                    const isReserved = c.reservations.some((r: any) => r.userId === userId)
                    const isFull = c.reservations.length >= c.capacity
                    const hora = new Date(c.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <div key={c.id} className="pdp-disclosure-row hover:bg-soft-cloud px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
                        <div className="flex items-center gap-6">
                          <div className="text-heading-xl font-display text-ink uppercase">
                            {hora}
                          </div>
                          <div>
                            <h3 className="text-body-strong text-ink uppercase tracking-tight">Entrenamiento Libre</h3>
                            <p className="text-caption-sm text-mute uppercase mt-1">
                              Plazas ocupadas: {c.reservations.length} / {c.capacity}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isReserved ? (
                            <span className="text-success text-body-strong font-display uppercase tracking-widest flex items-center gap-2">
                              Reservado ✓
                            </span>
                          ) : isFull ? (
                            <span className="text-sale text-body-strong font-display uppercase tracking-widest flex items-center gap-2">
                              Completo
                            </span>
                          ) : (
                            <Link 
                              href={`/clases/${c.id}`}
                              className="button-primary"
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