// src/app/reglas/page.jsx
export default function ReglasPage() {
  return (
    <main className="max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">
        Reglas de la comunidad
      </h2>
      <p className="text-sm text-slate-300">
        Este proyecto existe para que la gente pueda desahogarse, compartir historias y sentirse menos sola.
        No es un espacio para atacar personas ni grupos.
      </p>
      <ul className="list-disc pl-5 text-sm text-slate-300 space-y-2">
        <li>No publiques nombres completos, direcciones, teléfonos, redes sociales ni datos que identifiquen directamente a alguien.</li>
        <li>No publiques acusaciones graves contra personas identificables (delitos, abusos, etc.). Esos temas se deben tratar por vías legales y profesionales.</li>
        <li>No se permite contenido que promueva odio, violencia o discriminación hacia personas o grupos.</li>
        <li>No se permite apología de la violencia, autolesiones ni suicidio. Si estás en una situación de riesgo, acude a profesionales de salud.</li>
        <li>Los mensajes pueden ser moderados, editados o eliminados si infringen estas reglas, a criterio del equipo.</li>
      </ul>
      <p className="text-xs text-slate-500">
        Recuerda: esto es entretenimiento y desahogo, no asesoría profesional ni reemplazo de ayuda psicológica, médica o legal.
      </p>
    </main>
  );
}
