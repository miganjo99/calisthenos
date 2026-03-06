import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  async function authenticate(formData: FormData) {
    'use server'
    try {
      await signIn('credentials', {
        ...Object.fromEntries(formData),
        redirectTo: '/dashboard', 
      })
    } catch (err) {
      if (err instanceof AuthError) {
        redirect('/login?error=true')
      }
      throw err 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-md">
            <p className="text-sm font-bold text-red-800">
              Acceso denegado
            </p>
            <p className="text-sm text-red-600 mt-1">
              El correo o la contraseña no son correctos, o tu cuenta no existe.
            </p>
          </div>
        )}
        
        <form action={authenticate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" name="email" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-black outline-none transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" name="password" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-black outline-none transition" />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition shadow-lg mt-4">
            Entrar al Gimnasio
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline font-bold">Regístrate aquí</a>
        </p>
      </div>
    </div>
  )
}