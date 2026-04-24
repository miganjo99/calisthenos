'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { preCheckLogin, resetPassword } from '@/actions/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLocked, setIsLocked] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [lockedEmail, setLockedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      router.refresh()
      router.push('/dashboard')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-md">
            <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6 rounded-r-md">
            <p className="text-sm text-green-700 font-medium">{successMsg}</p>
          </div>
        )}

        {!isLocked && (
          <>
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h1>
            <form action={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input type="email" name="email" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-black outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" name="password" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-black outline-none transition" />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-black text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition shadow-lg mt-4 disabled:opacity-50">
                {isLoading ? 'Comprobando...' : 'Entrar al Gimnasio'}
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-gray-500">
              ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline font-bold">Regístrate aquí</a>
            </p>
          </>
        )}

        {isLocked && (
          <>
            <h1 className="text-xl font-bold text-center mb-2 text-gray-800">Recuperar Cuenta</h1>
            <p className="text-center text-sm text-gray-500 mb-6">Revisa tu correo ({lockedEmail}) e introduce el código de 6 dígitos para crear tu nueva contraseña.</p>
            <form action={handleRecovery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Código de seguridad</label>
                <input type="text" name="code" required placeholder="Ej: 123456" className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-black outline-none transition tracking-widest text-center" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input type="password" name="newPassword" placeholder="1 Mayúscula, mín. 6 caracteres" required className="mt-1 w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-black outline-none transition" />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition shadow-lg mt-4 disabled:opacity-50">
                {isLoading ? 'Actualizando...' : 'Guardar y Desbloquear'}
              </button>
            </form>
          </>
        )}
        
      </div>
    </div>
  )
}