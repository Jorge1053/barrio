// src/components/ConfessionCard.jsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, GraduationCap, Clock, Share2, Star, Flag } from "lucide-react";
import ConfessionReplies from "./ConfessionReplies"; // comenta esta línea si aún no tienes el componente

const categoryLabels = {
  amor: "Amor",
  estudio: "Estudio",
  familia: "Familia",
  trabajo: "Trabajo",
  plata: "Plata",
  random: "Random",
};

const FAVS_KEY = "confesionario:favs";

export default function ConfessionCard({ confession, onReact, onReport }) {
  const [expanded, setExpanded] = useState(false);
  const [sendingReaction, setSendingReaction] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    id,
    content = "",
    city,
    university,
    category,
    created_at,
    likes_count,
    wow_count,
    haha_count,
  } = confession;

  const likes = likes_count ?? 0;
  const wow = wow_count ?? 0;
  const haha = haha_count ?? 0;

  const createdLabel = created_at
    ? new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(created_at))
    : "";

  const shortText =
    content.length > 260 && !expanded ? `${content.slice(0, 260)}...` : content;

  const totalReactions = likes + wow + haha;
  const isPopular = totalReactions >= 30;

  const shortId = id ? id.slice(0, 6).toUpperCase() : "";

  // Cargar favoritos desde localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !id) return;
    try {
      const raw = window.localStorage.getItem(FAVS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.includes(id)) {
        setIsFavorite(true);
      }
    } catch {
      // ignorar
    }
  }, [id]);

  async function handleReact(type) {
    if (sendingReaction || !id) return;
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
    if (sendingReport || !id) return;
    const reason = window.prompt(
      "Contanos brevemente por qué considerás que esta confesión debería revisarse:"
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

  async function handleShare() {
    if (!id) return;
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = origin ? `${origin}/confesiones/${id}` : "";

      const shareText = `Confesión #${shortId} desde ConfesionarioAR`;

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({
          title: `Confesión #${shortId}`,
          text: shareText,
          url,
        });
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        url
      ) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (url) {
        window.prompt("Copiá este link:", url);
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo compartir. Intenta de nuevo.");
    }
  }

  function toggleFavorite() {
    if (typeof window === "undefined" || !id) return;
    try {
      const raw = window.localStorage.getItem(FAVS_KEY);
      let favs = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) favs = parsed;
      }

      let newFavs;
      if (favs.includes(id)) {
        newFavs = favs.filter((x) => x !== id);
        setIsFavorite(false);
      } else {
        newFavs = [...favs, id];
        setIsFavorite(true);
      }

      window.localStorage.setItem(FAVS_KEY, JSON.stringify(newFavs));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
      {/* HEADER */}
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            {city && (
              <span className="inline-flex items-center gap-1 text-slate-200">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span className="font-medium">{city}</span>
              </span>
            )}
            {university && (
              <span className="inline-flex items-center gap-1 text-slate-300">
                <GraduationCap className="h-3 w-3 text-slate-400" />
                <span>{university}</span>
              </span>
            )}
          </div>

          {createdLabel && (
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{createdLabel}</span>
            </div>
          )}

          {shortId && (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
              <span className="uppercase tracking-wide text-slate-400">
                Confesión
              </span>
              <span className="font-mono text-slate-200">#{shortId}</span>
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center rounded-full border border-pink-500/35 bg-pink-500/12 px-3 py-1 text-[11px] font-medium text-pink-200">
            {categoryLabels[category] || category}
          </span>
          {isPopular && (
            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              🔥 Popular
            </span>
          )}
        </div>
      </header>

      {/* TEXTO */}
      <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap break-words">
        {shortText}
        {content.length > 260 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-2 text-xs text-pink-300 underline hover:text-pink-200"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </p>

      {/* FOOTER */}
      <footer className="mt-4 space-y-3 text-xs">
        {/* Reacciones */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={sendingReaction}
              onClick={() => handleReact("like")}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1.5 text-xs transition-colors hover:bg-slate-700 disabled:opacity-60"
              aria-label="Reacción me gusta"
            >
              <span className="text-base">❤️</span>
              <span>{likes}</span>
            </button>
            <button
              type="button"
              disabled={sendingReaction}
              onClick={() => handleReact("wow")}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1.5 text-xs transition-colors hover:bg-slate-700 disabled:opacity-60"
              aria-label="Reacción sorpresa"
            >
              <span className="text-base">😮</span>
              <span>{wow}</span>
            </button>
            <button
              type="button"
              disabled={sendingReaction}
              onClick={() => handleReact("haha")}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1.5 text-xs transition-colors hover:bg-slate-700 disabled:opacity-60"
              aria-label="Reacción risa"
            >
              <span className="text-base">😂</span>
              <span>{haha}</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 sm:text-right">
            {totalReactions} reacciones
          </span>
        </div>

        {/* Acciones secundarias */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1.5 text-xs transition-colors hover:bg-slate-700"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-200" />
              <span>{copied ? "Link copiado" : "Compartir"}</span>
            </button>

            <button
              type="button"
              onClick={toggleFavorite}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1.5 text-xs transition-colors hover:bg-slate-700"
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  isFavorite
                    ? "fill-amber-300 text-amber-300"
                    : "text-slate-200"
                }`}
              />
              <span>{isFavorite ? "Guardada" : "Guardar"}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={sendingReport}
            onClick={handleReport}
            className="inline-flex items-center gap-1 self-start text-slate-500 hover:text-red-300 hover:underline sm:self-auto"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Reportar</span>
          </button>
        </div>
      </footer>

      {/* Comentarios anónimos (opcional, si tienes el componente) */}
      {id && <ConfessionReplies confessionId={id} />}
    </article>
  );
}
