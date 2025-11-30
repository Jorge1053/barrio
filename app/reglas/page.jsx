// src/app/reglas/page.jsx

export default function ReglasPage() {
  return (
    <main className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">
          Reglas de la Comunidad
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Para mantener este espacio seguro y respetuoso, es importante seguir
          estas reglas al publicar confesiones o interactuar con el contenido.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 md:px-6 md:py-5 space-y-4 text-sm text-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            1. Anonimato y datos personales
          </h2>
          <p className="mt-1 text-slate-300">
            La idea de este espacio es que puedas expresarte de forma anónima y
            responsable. No se permite:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Mencionar nombres y apellidos reales</li>
            <li>
              Compartir teléfonos, direcciones o información de contacto de
              terceros
            </li>
            <li>
              Identificar explícitamente a personas, instituciones o lugares de
              forma que puedan ser reconocidos
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            2. Respeto y no difamación
          </h2>
          <p className="mt-1 text-slate-300">
            No se permite utilizar el Servicio para atacar, humillar o difamar a
            otras personas. Está prohibido:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Publicar acusaciones graves contra personas identificables</li>
            <li>Insultar, acosar o intimidar a otras personas</li>
            <li>
              Utilizar lenguaje de odio hacia colectivos (por raza, género,
              orientación sexual, religión, etc.)
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            3. Contenido sensible y seguridad
          </h2>
          <p className="mt-1 text-slate-300">
            Queremos que hablar de temas intensos sea posible, pero siempre de
            manera responsable. Por eso:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>
              No se permite contenido que promueva autolesiones, suicidio o
              conductas peligrosas.
            </li>
            <li>
              No está permitido describir violencia explícita o actos crueles
              de forma gráfica.
            </li>
            <li>
              No se permite contenido sexual explícito, especialmente si involucra
              a menores de edad.
            </li>
          </ul>
          <p className="mt-2 text-slate-300">
            Si estás atravesando una situación de riesgo, lo más importante es
            que busques ayuda profesional en tu país o región.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            4. Contenido multimedia
          </h2>
          <p className="mt-1 text-slate-300">
            Para reducir riesgos y proteger a todas las personas, no se aceptan:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Fotos o videos de personas reales</li>
            <li>Capturas de pantallas de chats, redes sociales u otros sitios</li>
            <li>Cualquier archivo multimedia que pueda identificar a terceros</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            5. Spam y publicidad
          </h2>
          <p className="mt-1 text-slate-300">
            Este no es un espacio para autopromoción ni publicidad. No se
            permite:
          </p>
          <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
            <li>Publicar enlaces con fines comerciales sin autorización</li>
            <li>Enviar contenido repetitivo o claramente irrelevante</li>
            <li>Compartir enlaces maliciosos o engañosos</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            6. Moderación y reportes
          </h2>
          <p className="mt-1 text-slate-300">
            Nuestro equipo puede eliminar confesiones o reacciones que vayan en
            contra de estas reglas. Si ves algo que considerás dañino, ilegal o
            fuera de lugar, podés usar el botón de{" "}
            <span className="font-semibold text-slate-100">Reportar</span> para
            que lo revisemos.
          </p>
          <p className="mt-2 text-slate-300">
            La moderación no es perfecta, pero se realiza de buena fe y con el
            objetivo de cuidar a la comunidad.
          </p>
        </div>
      </section>
    </main>
  );
}
