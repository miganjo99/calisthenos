import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="bg-canvas text-ink">

      {/* HERO SECTION - Campaign Tile */}
      <section className="campaign-tile h-[80vh] flex items-end">
        {/* Placeholder for editorial photography */}
        <div className="absolute inset-0 bg-ink">
           {/* In a real scenario, an img tag would go here. We leave it solid ink. */}
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 pb-12 sm:pb-24">
          <h1 className="font-display text-[64px] sm:text-display-campaign leading-none uppercase max-w-4xl text-on-primary">
            Domina tu cuerpo.<br />
            Eleva tu límite.
          </h1>
          <p className="text-body-strong text-on-primary mt-6 mb-8 max-w-2xl">
            Únete al mejor centro de calistenia. Entrenamiento libre guiado, grupos reducidos y una comunidad que te empuja a ser mejor cada día.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {session?.user ? (
              <>
                <Link href="/clases" className="button-secondary">
                  Reservar mi próximo entreno
                </Link>
                <Link href="/dashboard" className="button-outline-on-image !bg-transparent !text-on-primary border border-on-primary">
                  Ir a mi perfil
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="button-secondary">
                  Empezar Gratis
                </Link>
                <Link href="/clases" className="button-outline-on-image !bg-transparent !text-on-primary border border-on-primary">
                  Ver Horarios
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-section px-4 sm:px-8 max-w-[1440px] mx-auto">
        <div className="mb-section">
          <h2 className="text-heading-xl text-ink uppercase font-display">Entrena a tu manera</h2>
          <p className="mt-2 text-body-md text-charcoal max-w-2xl">Nuestro sistema de "Open Gym" te da total libertad sin perder la motivación del grupo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-4">1. Reserva tu hora</h3>
            <p className="text-body-md text-charcoal">
              Grupos reducidos de máximo 15 personas por hora para asegurar espacio, material y calidad en tu entrenamiento.
            </p>
          </div>

          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-4">2. Elige tu rutina</h3>
            <p className="text-body-md text-charcoal">
              ¿Hoy toca Full Body, Empuje o Pierna? Tú decides el enfoque de tu sesión antes de confirmar tu asistencia.
            </p>
          </div>

          <div className="bg-soft-cloud p-8">
            <h3 className="text-heading-lg mb-4">3. Suda en equipo</h3>
            <p className="text-body-md text-charcoal">
              Mira qué rutinas han elegido tus compañeros, únete a ellos y empujaos mutuamente para romper vuestros récords.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-container max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="text-body-strong text-ink mb-4">Calisthenos</h4>
            <div className="flex flex-col gap-2">
              <Link href="/clases" className="hover:underline">Horarios</Link>
              <Link href="/ranking" className="hover:underline">Ranking de Atletas</Link>
            </div>
          </div>
          <div>
            <h4 className="text-body-strong text-ink mb-4">Ayuda</h4>
            <div className="flex flex-col gap-2">
              <Link href="#" className="hover:underline">Contacto</Link>
              <Link href="#" className="hover:underline">FAQ</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-hairline flex justify-between items-center text-utility-xs text-stone uppercase">
          <p>© {new Date().getFullYear()} Calisthenos, Inc. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}