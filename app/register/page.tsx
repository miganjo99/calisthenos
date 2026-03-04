'use client'

import { useState } from 'react'
import { registerUser } from '@/actions/auth'

export default function RegisterPage() {
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setMessage('Registrando...')
    const result = await registerUser(formData)

    if (result.error) {
      setMessage(`❌ Error: ${result.error}`)
    } else if (result.success) {
      setMessage(`✅ ¡Usuario creado con éxito! Hola, ${result.user?.name}`)
      // Aquí más adelante lo redirigiremos al login
    }
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
            <input type="text" name="name" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" name="email" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" name="password" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black" />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 transition">
            Crear cuenta
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm font-medium text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}