// src/app/privacidad/page.jsx

const SITE_OWNER_NAME = "ConfesAR"; // cámbialo por tu nombre/brand
const CONTACT_EMAIL = "tu-email@ejemplo.com";
const LAST_UPDATE = "29 de noviembre de 2025";

export default function PrivacidadPage() {
  return (
    <main className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">
          Política de Privacidad
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Última actualización: {LAST_UPDATE}
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Esta Política de Privacidad describe cómo {SITE_OWNER_NAME} recopila,
          utiliza y protege la información en este sitio web de confesiones
          anónimas (el &quot;Servicio&quot;).
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 md:px-6 md:py-5 space-y-4 text-sm text-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            1. Información que recopilamos
          </h2>
          <p className="mt-1 text-slate-300">
            El Servicio está diseñado para funcionar de forma anónima. No
            solicitamos ni almacenamos datos personales identificables como:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 text-sm space-y-1">
            <li>Nombre y apellido</li>
            <li>DNI o documentos de identidad</li>
            <li>Direcciones físicas</li>
            <li>Números de teléfono</li>
            <li>Correos electrónicos</li>
            <li>Fotografías o contenido multimedia de personas reales</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            1.1 Identificador anónimo (fingerprint/hash)
          </h3>
          <p className="mt-1 text-slate-300">
            Para prevenir abuso, spam y reacciones duplicadas, el Servicio puede
            generar un identificador técnico anónimo (&quot;fingerprint&quot;),
            que se almacena como un valor no reversible. Este identificador no
            permite identificar directamente a una persona concreta.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            1.2 Datos técnicos mínimos
          </h3>
          <p className="mt-1 text-slate-300">
            Podemos recolectar información técnica mínima, como:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Navegador y sistema operativo</li>
            <li>Páginas visitadas dentro del Servicio</li>
            <li>Hora y fecha de acceso</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Estos datos se utilizan de forma agregada y anónima para mejorar el
            funcionamiento del Servicio y la experiencia de uso.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            1.3 Cookies y tecnologías similares
          </h3>
          <p className="mt-1 text-slate-300">
            El Servicio utiliza cookies propias para:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Recordar ciertos filtros o preferencias de visualización</li>
            <li>Prevenir abuso de formularios</li>
            <li>Mantener funcionalidades básicas del sitio</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Estas cookies son consideradas técnicas o necesarias.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            1.4 Cookies de terceros (analítica y publicidad)
          </h3>
          <p className="mt-1 text-slate-300">
            Con tu consentimiento explícito, podemos activar cookies de terceros
            como:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Google Analytics u otras herramientas de analítica</li>
            <li>Google AdSense/Ezoic u otras redes publicitarias</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Estas cookies se usan para medir tráfico de forma agregada y mostrar
            anuncios relevantes. Puedes rechazar estas cookies desde el banner o
            la sección de configuración.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            2. Cómo utilizamos la información
          </h2>
          <p className="mt-1 text-slate-300">
            La información recopilada se utiliza exclusivamente para:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Mostrar confesiones anónimas y sus reacciones</li>
            <li>Moderación de contenido y respuesta a reportes</li>
            <li>Prevención de abuso, spam y usos indebidos</li>
            <li>Elaborar estadísticas agregadas y anónimas de uso</li>
            <li>Mostrar publicidad (solo si aceptaste cookies de terceros)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            3. Datos personales y contenidos sensibles
          </h2>
          <p className="mt-1 text-slate-300">
            El Servicio prohíbe expresamente que los usuarios compartan datos
            personales de terceros (nombre completo, teléfono, dirección,
            usuario de redes sociales, etc.) o información sensible que permita
            identificar a una persona real.
          </p>
          <p className="mt-2 text-slate-300">
            Cualquier confesión que contenga información de este tipo podrá ser
            eliminada sin previo aviso como parte de nuestro proceso de
            moderación.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            4. Compartir información con terceros
          </h2>
          <p className="mt-1 text-slate-300">
            No vendemos ni cedemos información personal de los usuarios. Solo
            podemos compartir información agregada y anónima con:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Proveedores de analítica</li>
            <li>Proveedores de publicidad</li>
          </ul>
          <p className="mt-2 text-slate-300">
            En casos excepcionales, podremos revelar información si una
            autoridad competente lo solicita de forma legal y fundada.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">5. Seguridad</h2>
          <p className="mt-1 text-slate-300">
            Utilizamos medidas razonables de seguridad, incluyendo conexiones
            cifradas (HTTPS) y almacenamiento limitado de información, con el
            objetivo de reducir riesgos de accesos no autorizados.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            6. Tus derechos
          </h2>
          <p className="mt-1 text-slate-300">
            De acuerdo con la normativa argentina en materia de protección de
            datos, puedes solicitar información adicional sobre el tratamiento
            de datos técnicos o pedir la eliminación de información asociada a
            tu uso del Servicio enviando un correo a:
          </p>
          <p className="mt-2 text-slate-100 font-medium">{CONTACT_EMAIL}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            7. Cambios en esta Política
          </h2>
          <p className="mt-1 text-slate-300">
            Podemos actualizar esta Política de Privacidad para reflejar cambios
            en el Servicio o en la normativa aplicable. Publicaremos la nueva
            versión en este mismo apartado indicando la fecha de última
            actualización.
          </p>
        </div>
      </section>
    </main>
  );
}
