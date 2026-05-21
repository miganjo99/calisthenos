'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { preCheckLogin, resetPassword } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLocked, setIsLocked] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [lockedEmail, setLockedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  async function handleLogin(formData: FormData) {
    setIsLoading(true)
    setErrorMsg('')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const check = await preCheckLogin(email, password)
    
    if (check.locked) {
      setLockedEmail(email)
      setIsLocked(true)
      setErrorMsg(check.error || 'Cuenta bloqueada.')
      setIsLoading(false)
      return
    }

    if (check.error) {
      setErrorMsg(check.error)
      setIsLoading(false)
      return
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false 
    })

    if (result?.error) {
      setErrorMsg('Error al conectar con el servidor.')
    } else {
      window.location.href = '/dashboard'
    }
    setIsLoading(false)
  }

  async function handleRecovery(formData: FormData) {
    setIsLoading(true)
    setErrorMsg('')
    formData.append('email', lockedEmail) 
    
    const result = await resetPassword(formData)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('¡Contraseña actualizada! Ya puedes iniciar sesión.')
      setIsLocked(false) 
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-canvas py-12 px-4 sm:px-8">
      <div className="w-full max-w-[480px] sm:border sm:border-hairline sm:p-12">
        
        {errorMsg && (
          <div className="mb-6 py-4 text-center text-body-strong text-sale border border-sale">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 py-4 text-center text-body-strong text-success border border-success">
            {successMsg}
          </div>
        )}

        {!isLocked && (
          <>
            <h1 className="text-heading-xl font-display uppercase tracking-tighter text-center mb-8 text-ink">Iniciar Sesión</h1>
            <form action={handleLogin} className="space-y-4">
              <div>
                <label className="block text-body-strong text-ink mb-2">Correo electrónico</label>
                <input type="email" name="email" required className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition" />
              </div>
              <div>
                <label className="block text-body-strong text-ink mb-2">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" required className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal hover:text-ink transition-colors">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" /><path d="M3 15l2.5 -3.8" /><path d="M21 14.976l-2.492 -3.776" /><path d="M9 17l.5 -4" /><path d="M15 17l-.5 -4" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="button-primary w-full mt-6">
                {isLoading ? 'Comprobando...' : 'Entrar al Gimnasio'}
              </button>
            </form>
            <p className="text-center mt-8 text-body-md text-charcoal">
              ¿No tienes cuenta? <Link href="/register" className="text-ink underline font-medium hover:opacity-70">Regístrate aquí</Link>
            </p>
          </>
        )}

        {isLocked && (
          <>
            <h1 className="text-heading-lg font-display uppercase tracking-tighter text-center mb-4 text-ink">Recuperar Cuenta</h1>
            <p className="text-center text-body-md text-charcoal mb-8">Revisa tu correo ({lockedEmail}) e introduce el código de 6 dígitos para crear tu nueva contraseña.</p>
            <form action={handleRecovery} className="space-y-4">
              <div>
                <label className="block text-body-strong text-ink mb-2">Código de seguridad</label>
                <input type="text" name="code" required placeholder="Ej: 123456" className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition tracking-widest text-center" />
              </div>
              <div>
                <label className="block text-body-strong text-ink mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <input type={showNewPassword ? "text" : "password"} name="newPassword" placeholder="1 Mayúscula, mín. 6 caracteres" required className="w-full bg-soft-cloud text-ink text-body-md rounded-md px-4 py-3 outline-none border border-transparent focus:bg-canvas focus:ring-2 focus:ring-ink focus:ring-offset-[12px] focus:ring-offset-soft-cloud transition pr-12" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal hover:text-ink transition-colors">
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" /><path d="M3 15l2.5 -3.8" /><path d="M21 14.976l-2.492 -3.776" /><path d="M9 17l.5 -4" /><path d="M15 17l-.5 -4" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="button-primary w-full mt-6 bg-sale text-on-primary hover:opacity-90">
                {isLoading ? 'Actualizando...' : 'Guardar y Desbloquear'}
              </button>
            </form>
          </>
        )}
        
      </div>
    </div>
  )
}