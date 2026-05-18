import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function EntrenamientosAdminPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== "admin") redirect("/dashboard")

  const entrenamientos = await prisma.training.findMany({
    orderBy: { name: 'asc' }
  })

  async function createTraining(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    
    // Recopilamos los 10 ejercicios del formulario
    const exercises = []
    for (let i = 1; i <= 10; i++) {
      const ex = formData.get(`ejercicio-${i}`) as string
      if (ex && ex.trim() !== "") exercises.push(ex)
    }

    await prisma.training.create({
      data: { name, description, exercises }
    })

    revalidatePath("/admin/entrenamientos")
  }

  return (
    <div className="bg-canvas py-section px-4 sm:px-8 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto space-y-section">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-hairline pb-section gap-4">
          <div>
            <h1 className="text-heading-xl font-display uppercase tracking-tighter text-ink">Tipos de Entrenamiento</h1>
            <p className="text-body-md text-charcoal mt-2">Gestiona las rutinas y sus ejercicios.</p>
          </div>
          <Link href="/admin" className="text-link-md text-ink hover:opacity-70 uppercase tracking-wider">Volver al Panel</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 bg-soft-cloud p-8 h-fit lg:sticky lg:top-24">
            <h2 className="text-heading-lg font-display uppercase text-ink mb-6">Nuevo Entrenamiento</h2>
            <form action={createTraining} className="space-y-6">
              <div>
                <label className="block text-body-strong uppercase text-ink mb-2">Nombre de la rutina</label>
                <input type="text" name="name" required placeholder="Ej: Full Body" className="w-full bg-canvas text-ink text-body-md rounded-md px-4 py-3 outline-none border border-hairline focus:ring-2 focus:ring-ink transition" />
              </div>
              
              <div>
                <label className="block text-body-strong uppercase text-ink mb-2">Descripción</label>
                <textarea name="description" required placeholder="Enfoque global..." className="w-full bg-canvas text-ink text-body-md rounded-md px-4 py-3 outline-none border border-hairline focus:ring-2 focus:ring-ink transition h-24 resize-none"></textarea>
              </div>

              <div className="pt-6 border-t border-hairline">
                <label className="block text-body-strong uppercase text-ink mb-4">Los 10 Ejercicios</label>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-caption-sm font-bold text-mute w-4 uppercase">{i + 1}.</span>
                      <input 
                        type="text" 
                        name={`ejercicio-${i + 1}`} 
                        placeholder={i === 9 ? "Ejercicio a elegir" : `Ejercicio ${i + 1}`} 
                        className="w-full bg-canvas text-ink text-body-md rounded-md px-3 py-2 outline-none border border-hairline focus:ring-2 focus:ring-ink transition" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="button-primary w-full py-4 text-heading-md uppercase tracking-wider mt-6">
                Guardar Entrenamiento
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-sm">
            {entrenamientos.map((ent) => (
              <div key={ent.id} className="bg-canvas border border-hairline p-8 hover:bg-soft-cloud transition-colors">
                <div className="flex justify-between items-start mb-6 border-b border-hairline pb-4">
                  <div>
                    <h3 className="text-heading-lg font-display uppercase text-ink tracking-tighter">{ent.name}</h3>
                    <p className="text-body-md text-charcoal mt-2">{ent.description}</p>
                  </div>
                </div>
                
                {ent.exercises.length > 0 ? (
                  <div>
                    <p className="text-caption-sm text-mute uppercase tracking-widest mb-4">Ejercicios ({ent.exercises.length}):</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      {ent.exercises.map((ejercicio, index) => (
                        <li key={index} className="text-body-md text-charcoal flex items-start gap-3">
                          <span className="text-ink font-display text-body-strong uppercase">{index + 1}.</span> {ejercicio}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-body-md text-sale italic mt-4">No hay ejercicios asignados a esta rutina (Rutina antigua).</p>
                )}
              </div>
            ))}
            
            {entrenamientos.length === 0 && (
              <div className="bg-soft-cloud p-12 text-center">
                <p className="text-body-md text-charcoal">Aún no has creado ningún entrenamiento.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}