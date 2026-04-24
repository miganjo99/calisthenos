'use client'

import { useState } from 'react'
import { registerUser } from '@/actions/auth'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage('Registrando...')
    setIsError(false)
    
    const result = await registerUser(formData)

    if (result.error) {
      setMessage(`❌ ${result.error}`)
      setIsError(true)
    } else if (result.success) {
      setMessage(`✅ ¡Cuenta creada! Redirigiendo al login...`)
      setTimeout(() => router.push('/login'), 2000)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Únete al Gimnasio
        </h1>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input type="text" name="name" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black outline-none focus:ring-2 focus:ring-black transition" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" name="email" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black outline-none focus:ring-2 focus:ring-black transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Mín. 6 caracteres y 1 Mayúscula"
              required 
              className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black outline-none focus:ring-2 focus:ring-black transition" 
            />
          </div>

          <button disabled={isLoading} type="submit" className="w-full bg-black text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition shadow-lg mt-4 disabled:opacity-50">
            {isLoading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-md text-sm font-medium border-l-4 ${isError ? 'bg-red-50 text-red-700 border-red-600' : 'bg-green-50 text-green-700 border-green-600'}`}>
            {message}
          </div>
        )}

        <p className="text-center mt-6 text-sm text-gray-500">
          ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 hover:underline font-bold">Inicia sesión</a>
        </p>
      </div>
    </div>
  )
}