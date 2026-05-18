'use client'

import { useState } from 'react'
import { registerUser } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      setMessage(result.error)
      setIsError(true)
    } else if (result.success) {
      setMessage(`¡Cuenta creada! Redirigiendo al login...`)
      setTimeout(() => router.push('/login'), 2000)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-canvas py-12 px-4 sm:px-8">
      <div className="w-full max-w-[480px] sm:border sm:border-hairline sm:p-12">
        <h1 className="text-heading-xl font-display uppercase tracking-tighter text-center mb-8 text-ink">
          Únete al Gimnasio
        </h1>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-strong text-ink mb-2">Nombre completo</label>
            <input type="text" name="name" required className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition" />
          </div>
          
          <div>
            <label className="block text-body-strong text-ink mb-2">Correo electrónico</label>
            <input type="email" name="email" required className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition" />
          </div>

          <div>
            <label className="block text-body-strong text-ink mb-2">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Mín. 6 caracteres y 1 Mayúscula"
              required 
              className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition" 
            />
          </div>

          <button disabled={isLoading} type="submit" className="button-primary w-full mt-6">
            {isLoading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 py-4 text-center text-body-strong ${isError ? 'text-sale' : 'text-success'}`}>
            {message}
          </div>
        )}

        <p className="text-center mt-8 text-body-md text-charcoal">
          ¿Ya tienes cuenta? <Link href="/login" className="text-ink underline font-medium hover:opacity-70">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}