// src/app/terminos/page.jsx

const SITE_OWNER_NAME = "ConfesionarioAR";
const CONTACT_EMAIL = "tu-email@ejemplo.com";
const LAST_UPDATE = "29 de noviembre de 2025";

export default function TerminosPage() {
  return (
    <main className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">
          Términos y Condiciones de Uso
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Última actualización: {LAST_UPDATE}
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Estos Términos y Condiciones regulan el acceso y uso del sitio web de
          confesiones anónimas operado por {SITE_OWNER_NAME} (en adelante, el
          &quot;Servicio&quot;).
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 md:px-6 md:py-5 space-y-4 text-sm text-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            1. Aceptación de los Términos
          </h2>
          <p className="mt-1 text-slate-300">
            Al acceder o utilizar el Servicio, el usuario acepta quedar
            vinculado por estos Términos y Condiciones. Si no estás de acuerdo
            con alguno de los puntos, no debes utilizar el Servicio.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            2. Naturaleza del Servicio
          </h2>
          <p className="mt-1 text-slate-300">
            El Servicio es una plataforma de confesiones anónimas. No
            verificamos la identidad de las personas que publican contenido ni
            garantizamos la veracidad, exactitud o integridad de las
            confesiones.
          </p>
          <p className="mt-2 text-slate-300">
            El contenido representa exclusivamente la opinión o experiencia de
            los usuarios que lo publican.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            3. Contenido prohibido
          </h2>
          <p className="mt-1 text-slate-300">
            El usuario se compromete a no publicar contenido que:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>
              Identifique directamente a una persona real (nombre completo,
              apodo claramente identificable, usuario de redes sociales,
              teléfono, dirección, etc.).
            </li>
            <li>
              Contenga acusaciones, denuncias o difamación hacia personas
              identificables.
            </li>
            <li>
              Incite al odio, discriminación, violencia física o psicológica.
            </li>
            <li>
              Incluya contenido sexual explícito, especialmente vinculado a
              menores de edad.
            </li>
            <li>
              Promueva autolesiones, suicidio o conductas peligrosas.
            </li>
            <li>
              Incluya spam, publicidad no autorizada o enlaces maliciosos.
            </li>
            <li>
              Vulnere derechos de autor o propiedad intelectual de terceros.
            </li>
          </ul>
          <p className="mt-2 text-slate-300">
            Cualquier contenido que incumpla estas reglas podrá ser eliminado
            sin previo aviso.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            4. Moderación y facultades del Servicio
          </h2>
          <p className="mt-1 text-slate-300">
            El Servicio puede revisar, moderar y eliminar publicaciones que
            considere inapropiadas, ilegales o contrarias a estas condiciones.
            Esto incluye, entre otros:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Eliminar confesiones concretas</li>
            <li>Bloquear o limitar el uso desde ciertos dispositivos</li>
            <li>
              Suspender temporal o definitivamente el acceso a determinadas
              funciones
            </li>
          </ul>
          <p className="mt-2 text-slate-300">
            La moderación se realiza de buena fe y sin obligación de supervisar
            de forma previa absolutamente todos los contenidos.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            5. Limitación de responsabilidad
          </h2>
          <p className="mt-1 text-slate-300">
            El usuario entiende y acepta que:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>
              El contenido publicado es responsabilidad exclusiva de quien lo
              crea.
            </li>
            <li>
              {SITE_OWNER_NAME} no es responsable por daños directos o indirectos
              derivados del uso del Servicio o de la interpretación de las
              confesiones.
            </li>
            <li>
              No se garantiza que el Servicio esté disponible de forma continua,
              ininterrumpida o libre de errores.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            6. Propiedad intelectual
          </h2>
          <p className="mt-1 text-slate-300">
            Al enviar una confesión, el usuario concede al Servicio una licencia
            no exclusiva, mundial, gratuita y por tiempo indefinido para
            almacenar, mostrar, reproducir y distribuir dicho contenido dentro
            del contexto de la plataforma y sus redes asociadas.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            7. Edad mínima de uso
          </h2>
          <p className="mt-1 text-slate-300">
            El Servicio está dirigido a personas mayores de 16 años. Si eres
            menor de edad, debes contar con la autorización de tus padres,
            madres o tutores legales para utilizarlo.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            8. Ley aplicable y jurisdicción
          </h2>
          <p className="mt-1 text-slate-300">
            Estos Términos se rigen por las leyes de la República Argentina. En
            caso de controversia, las partes acuerdan someterse a los tribunales
            competentes del domicilio del titular del Servicio, salvo norma
            imperativa en contrario.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">9. Contacto</h2>
          <p className="mt-1 text-slate-300">
            Para consultas sobre estos Términos y Condiciones, puedes escribir a:
          </p>
          <p className="mt-2 text-slate-100 font-medium">{CONTACT_EMAIL}</p>
        </div>
      </section>
    </main>
  );
}
