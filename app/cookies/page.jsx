// src/app/cookies/page.jsx

const LAST_UPDATE = "29 de noviembre de 2025";

export default function CookiesPage() {
  return (
    <main className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">
          Política de Cookies
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Última actualización: {LAST_UPDATE}
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Esta Política de Cookies explica qué tipos de cookies utiliza este
          sitio, para qué se usan y cómo podés gestionarlas.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 md:px-6 md:py-5 space-y-4 text-sm text-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            1. ¿Qué son las cookies?
          </h2>
          <p className="mt-1 text-slate-300">
            Las cookies son pequeños archivos de texto que los sitios web
            almacenan en tu navegador para recordar cierta información sobre tu
            visita. Pueden ser técnicas (necesarias para que el sitio funcione),
            de analítica o de publicidad.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            2. Cookies que utilizamos
          </h2>
          <h3 className="mt-2 text-sm font-semibold text-slate-100">
            2.1 Cookies necesarias
          </h3>
          <p className="mt-1 text-slate-300">
            Son aquellas imprescindibles para el funcionamiento básico del
            sitio. Por ejemplo:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Recordar ciertas preferencias o filtros de búsqueda</li>
            <li>Prevenir envíos de formularios duplicados o abusivos</li>
            <li>Mantener configuraciones técnicas del Servicio</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Estas cookies no almacenan información personal identificable y no
            pueden desactivarse desde el panel de configuración, ya que
            romperían funcionalidades esenciales.
          </p>

          <h3 className="mt-4 text-sm font-semibold text-slate-100">
            2.2 Cookies de analítica (opcionales)
          </h3>
          <p className="mt-1 text-slate-300">
            Podemos utilizar herramientas de analítica (como Google Analytics)
            para recopilar información agregada y anónima sobre:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Páginas más visitadas</li>
            <li>Tiempo de permanencia en el sitio</li>
            <li>Dispositivos o navegadores más utilizados</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Estas cookies sólo se activan si das tu consentimiento a través del
            banner de cookies.
          </p>

          <h3 className="mt-4 text-sm font-semibold text-slate-100">
            2.3 Cookies de publicidad (opcionales)
          </h3>
          <p className="mt-1 text-slate-300">
            Para financiar el Servicio, podemos mostrar anuncios a través de
            redes publicitarias como Google AdSense o Ezoic. Estas redes pueden
            utilizar cookies para:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Evitar mostrarte siempre el mismo anuncio</li>
            <li>Medir el rendimiento de las campañas</li>
            <li>Mostrar anuncios más relevantes</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Estas cookies también requieren tu consentimiento explícito desde el
            banner o el panel de configuración.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            3. Gestión de cookies
          </h2>
          <p className="mt-1 text-slate-300">
            Podés gestionar tus preferencias de cookies desde:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>El banner de cookies que aparece en tu primera visita</li>
            <li>
              La sección de configuración de cookies del propio navegador
              (Chrome, Firefox, Safari, etc.)
            </li>
          </ul>
          <p className="mt-2 text-slate-300">
            Tené en cuenta que desactivar ciertas cookies puede afectar el
            funcionamiento del sitio o la calidad de algunos contenidos.
          </p>
        </div>
      </section>
    </main>
  );
}
