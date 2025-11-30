// src/components/ConfessionCard.jsx
"use client";

import { useState } from "react";

const categoryLabels = {
  amor: "Amor",
  estudio: "Estudio",
  familia: "Familia",
  trabajo: "Trabajo",
  plata: "Plata",
  random: "Random",
};

export default function ConfessionCard({ confession, onReact, onReport }) {
  const [expanded, setExpanded] = useState(false);
  const [sendingReaction, setSendingReaction] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);

  const {
    id,
    content,
    city,
    university,
    category,
    created_at,
    likes_count,
    wow_count,
    haha_count,
  } = confession;

  const createdLabel = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(created_at));

  const shortText =
    content.length > 260 && !expanded ? content.slice(0, 260) + "..." : content;

  async function handleReact(type) {
    if (sendingReaction) return;
    setSendingReaction(true);
    try {
      await onReact?.(id, type);
    } catch (e) {
      console.error(e);
      alert("No se pudo registrar la reacción, intenta de nuevo.");
    } finally {
      setSendingReaction(false);
    }
  }

  async function handleReport() {
    if (sendingReport) return;
    const reason = window.prompt(
      "Cuéntanos brevemente por qué consideras que esta confesión debería revisarse:"
    );
    if (!reason || reason.trim().length < 5) return;
    setSendingReport(true);
    try {
      await onReport?.(id, reason.trim());
      alert("Gracias. Tu reporte se envió para revisión.");
    } catch (e) {
      console.error(e);
      alert("No se pudo enviar el reporte.");
    } finally {
      setSendingReport(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
      <header className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-col text-xs text-slate-400">
          <span className="font-medium text-slate-200">
            {city}
            {university ? ` · ${university}` : ""}
          </span>
          <span>{createdLabel}</span>
        </div>
        <span className="inline-flex items-center rounded-full bg-pink-500/15 text-pink-300 px-3 py-1 text-xs font-medium border border-pink-500/40">
          {categoryLabels[category] || category}
        </span>
      </header>

      <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">
        {shortText}
        {content.length > 260 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-2 text-xs text-pink-300 hover:text-pink-200 underline"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </p>

      <footer className="mt-3 flex items-center justify-between gap-2 text-xs">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={sendingReaction}
            onClick={() => handleReact("like")}
            className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1"
          >
            <span>❤️</span>
            <span>{likes_count}</span>
          </button>
          <button
            type="button"
            disabled={sendingReaction}
            onClick={() => handleReact("wow")}
            className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1"
          >
            <span>😮</span>
            <span>{wow_count}</span>
          </button>
          <button
            type="button"
            disabled={sendingReaction}
            onClick={() => handleReact("haha")}
            className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1"
          >
            <span>😂</span>
            <span>{haha_count}</span>
          </button>
        </div>
        <button
          type="button"
          disabled={sendingReport}
          onClick={handleReport}
          className="text-slate-500 hover:text-red-300 hover:underline"
        >
          Reportar
        </button>
      </footer>
    </article>
  );
}
