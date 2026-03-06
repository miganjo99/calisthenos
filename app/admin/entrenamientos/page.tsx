import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tipos de Entrenamiento</h1>
            <p className="text-gray-500">Gestiona las rutinas y sus ejercicios.</p>
          </div>
          <a href="/admin" className="text-blue-600 hover:underline font-medium">Volver al Panel</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm h-fit sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Entrenamiento</h2>
            <form action={createTraining} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la rutina</label>
                <input type="text" name="name" required placeholder="Ej: Full Body" className="mt-1 w-full border rounded-md p-2 text-gray-600" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea name="description" required placeholder="Enfoque global..." className="mt-1 w-full border rounded-md p-2 h-20 text-gray-600"></textarea>
              </div>

              <div className="pt-2 border-t">
                <label className="block text-sm font-bold text-gray-800 mb-2">Los 10 Ejercicios</label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                      <input 
                        type="text" 
                        name={`ejercicio-${i + 1}`} 
                        placeholder={i === 9 ? "Ejercicio a elegir" : `Ejercicio ${i + 1}`} 
                        className="w-full border rounded-md p-1.5 text-sm text-gray-600" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 transition mt-4">
                Guardar Entrenamiento
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {entrenamientos.map((ent) => (
              <div key={ent.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{ent.name}</h3>
                    <p className="text-gray-600 mt-1">{ent.description}</p>
                  </div>
                  {/* Aquí en el futuro pondremos un botón para borrar */}
                </div>
                
                {ent.exercises.length > 0 ? (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-bold text-gray-700 mb-2">Ejercicios ({ent.exercises.length}):</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ent.exercises.map((ejercicio, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-black font-medium">{index + 1}.</span> {ejercicio}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-orange-500 italic">No hay ejercicios asignados a esta rutina (Rutina antigua).</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}