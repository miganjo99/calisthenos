import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export default function LoginPage() {
  
  async function authenticate(formData: FormData) {
    'use server'
    try {
      await signIn('credentials', {
        ...Object.fromEntries(formData),
        redirectTo: '/dashboard', 
      })
    } catch (error) {
      if (error instanceof AuthError) {
        console.log("Error de credenciales")
      }
      throw error 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h1>
        
        <form action={authenticate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" name="email" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" name="password" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black" />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 transition">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}