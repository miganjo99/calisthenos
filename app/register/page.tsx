'use client'

import { useState } from 'react'
import { registerUser } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage('Registrando...')
    setIsError(false)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      setIsError(true)
      setIsLoading(false)
      return
    }

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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Mín. 6 caracteres y 1 Mayúscula"
                required 
                className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition pr-12" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal hover:text-ink transition-colors">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" /><path d="M3 15l2.5 -3.8" /><path d="M21 14.976l-2.492 -3.776" /><path d="M9 17l.5 -4" /><path d="M15 17l-.5 -4" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-body-strong text-ink mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Repite tu contraseña"
                required 
                className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition pr-12" 
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal hover:text-ink transition-colors">
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" /><path d="M3 15l2.5 -3.8" /><path d="M21 14.976l-2.492 -3.776" /><path d="M9 17l.5 -4" /><path d="M15 17l-.5 -4" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                )}
              </button>
            </div>
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