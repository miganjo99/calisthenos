import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      
      <section className="bg-gradient-to-b from-black to-gray-900 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
            Domina tu cuerpo.<br/>
            <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Eleva tu límite.
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Únete al mejor centro de calistenia. Entrenamiento libre guiado, grupos reducidos y una comunidad que te empuja a ser mejor cada día.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {session?.user ? (
              <>
                <Link href="/clases" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:scale-105 transition transform shadow-lg shadow-blue-500/30">
                  Reservar mi próximo entreno
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition">
                  Ir a mi perfil
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:scale-105 transition transform shadow-lg shadow-blue-500/30">
                  Empezar Gratis
                </Link>
                <Link href="/clases" className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition">
                  Ver Horarios
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Entrena a tu manera</h2>
          <p className="mt-4 text-lg text-gray-600">Nuestro sistema de "Open Gym" te da total libertad sin perder la motivación del grupo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition text-center group">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 transform group-hover:-rotate-6 transition">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Reserva tu hora</h3>
            <p className="text-gray-600">
              Grupos reducidos de máximo 15 personas por hora para asegurar espacio, material y calidad en tu entrenamiento.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition text-center group">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 transform group-hover:scale-110 transition">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Elige tu rutina</h3>
            <p className="text-gray-600">
              ¿Hoy toca Full Body, Empuje o Pierna? Tú decides el enfoque de tu sesión antes de confirmar tu asistencia.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition text-center group">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 transform group-hover:rotate-6 transition">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Suda en equipo</h3>
            <p className="text-gray-600">
              Mira qué rutinas han elegido tus compañeros, únete a ellos y empujaos mutuamente para romper vuestros récords.
            </p>
          </div>

        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200 py-12 text-center text-gray-500">
        <p className="font-bold text-gray-800 text-lg mb-2">Cali<span className="text-blue-600">Gym</span></p>
        <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}