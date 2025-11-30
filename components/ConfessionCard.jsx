// src/components/ConfessionCard.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  GraduationCap,
  Clock,
  Share2,
  Star,
  Flag,
  Image as ImageIcon,
} from "lucide-react";
import html2canvas from "html2canvas";
import ConfessionReplies from "./ConfessionReplies";
import ConfessionShareCard from "./ConfessionShareCard";

const categoryLabels = {
  amor: "Amor",
  estudio: "Estudio",
  familia: "Familia",
  trabajo: "Trabajo",
  plata: "Plata",
  random: "Random",
};

const intentionLabels = {
  advice: "Buscando consejo",
  vent: "Necesita desahogarse",
  story: "Historia para compartir",
};

const FAVS_KEY = "confesionario:favs";

export default function ConfessionCard({ confession, onReact, onReport }) {
  const [expanded, setExpanded] = useState(false);
  const [sendingReaction, setSendingReaction] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // UI para reportes / feedback
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message }

  // UI para imagen compartible
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const shareCardRef = useRef(null);

  const {
    id,
    content = "",
    city,
    university,
    category,
    intention,
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
  const intentionLabel = intention ? intentionLabels[intention] : null;

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

  function showFeedback(message, type = "success") {
    setFeedback({ message, type });
    if (typeof window !== "undefined") {
      window.clearTimeout(showFeedback._timer);
      showFeedback._timer = window.setTimeout(() => {
        setFeedback(null);
      }, 4000);
    }
  }

  async function handleReact(type) {
    if (sendingReaction || !id) return;
    setSendingReaction(true);
    try {
      await onReact?.(id, type);
    } catch (e) {
      console.error(e);
      showFeedback(
        "No se pudo registrar la reacción, intentá de nuevo.",
        "error"
      );
    } finally {
      setSendingReaction(false);
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
        typeof navigator.share === "function" &&
        url
      ) {
        await navigator.share({
          title: `Confesión #${shortId}`,
          text: shareText,
          url,
        });
        showFeedback("Link compartido.", "success");
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        url
      ) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        showFeedback("Link copiado al portapapeles.", "success");
        setTimeout(() => setCopied(false), 2000);
      } else if (url) {
        showFeedback(
          "No se pudo copiar automáticamente. Podés copiar la URL desde la barra del navegador.",
          "error"
        );
      }
    } catch (e) {
      console.error(e);
      showFeedback("No se pudo compartir, intentá de nuevo.", "error");
    }
  }

  // --- Reporte ---

  function openReport() {
    setReportMode(true);
    setReportError("");
    setReportReason("");
  }

  function cancelReport() {
    if (sendingReport) return;
    setReportMode(false);
    setReportError("");
    setReportReason("");
  }

  async function handleReportSubmit() {
    if (sendingReport || !id) return;
    const reason = reportReason.trim();

    if (reason.length < 5) {
      setReportError("Contanos un poco más (mínimo 5 caracteres).");
      return;
    }

    setSendingReport(true);
    setReportError("");
    try {
      await onReport?.(id, reason);
      setReportMode(false);
      setReportReason("");
      showFeedback("Gracias. Tu reporte se envió para revisión.", "success");
    } catch (e) {
      console.error(e);
      setReportError("No se pudo enviar el reporte. Intentá de nuevo.");
    } finally {
      setSendingReport(false);
    }
  }

  // --- Favoritos ---

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

  // --- Imagen para historias ---

  function openShareModal() {
    setShareModalOpen(true);
  }

  function closeShareModal() {
    if (generatingImage) return;
    setShareModalOpen(false);
  }

  async function handleDownloadImage() {
    if (!shareCardRef.current || generatingImage) return;
    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: "#020617", // fondo sólido oscuro
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `confesion-${shortId || id || "confesionario"}.png`;
      link.click();
      showFeedback("Imagen lista para subir a tus historias 🫶", "success");
    } catch (e) {
      console.error(e);
      showFeedback("No se pudo generar la imagen. Probá de nuevo.", "error");
    } finally {
      setGeneratingImage(false);
    }
  }

  return (
    <>
      <article
        id={id ? `confesion-${id}` : undefined}
        className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40"
      >
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
            {intentionLabel && (
              <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-[10px] font-medium text-slate-200">
                {intentionLabel}
              </span>
            )}
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
                <span>{copied ? "Link copiado" : "Compartir link"}</span>
              </button>

              <button
                type="button"
                onClick={openShareModal}
                className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1.5 text-xs transition-colors hover:bg-slate-700"
              >
                <ImageIcon className="h-3.5 w-3.5 text-pink-200" />
                <span>Imagen para historias</span>
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
              onClick={openReport}
              className="inline-flex items-center gap-1 self-start text-slate-500 hover:text-red-300 hover:underline sm:self-auto"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Reportar</span>
            </button>
          </div>

          {/* Formulario de reporte inline */}
          {reportMode && (
            <div className="mt-2 space-y-2 rounded-2xl border border-red-500/30 bg-red-500/5 p-3">
              <p className="text-[11px] font-medium text-red-200">
                Contanos brevemente por qué creés que esta confesión debería
                revisarse.
              </p>
              <textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Ej: contiene datos personales, insultos directos, etc."
                className="w-full resize-none rounded-xl border border-red-500/40 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/60"
              />
              {reportError && (
                <p className="text-[11px] text-red-300">{reportError}</p>
              )}
              <div className="flex items-center justify-end gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={cancelReport}
                  disabled={sendingReport}
                  className="rounded-full px-3 py-1.5 text-slate-300 hover:bg-slate-800/80 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  disabled={sendingReport}
                  className="rounded-full bg-red-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-red-400 disabled:opacity-60"
                >
                  {sendingReport ? "Enviando..." : "Enviar reporte"}
                </button>
              </div>
            </div>
          )}

          {/* Mensaje global de feedback */}
          {feedback && (
            <p
              className={`mt-1 rounded-xl px-2 py-1 text-[11px] border ${
                feedback.type === "success"
                  ? "border-emerald-600 bg-emerald-900/30 text-emerald-200"
                  : "border-red-700 bg-red-900/30 text-red-200"
              }`}
            >
              {feedback.message}
            </p>
          )}
        </footer>

        {/* Comentarios anónimos */}
        {id && <ConfessionReplies confessionId={id} />}
      </article>

      {/* MODAL de imagen para historias */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-black/60">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-100">
                  Imagen para historias
                </p>
                <p className="text-[11px] text-slate-400">
                  Descargá esta tarjeta y subila a IG Stories o donde quieras.
                </p>
              </div>
              <button
                type="button"
                onClick={closeShareModal}
                className="rounded-full px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-3 flex justify-center">
              <ConfessionShareCard
                ref={shareCardRef}
                content={content}
                city={city}
                category={category}
                intention={intention}
                shortId={shortId}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <p className="max-w-[60%] text-slate-500">
                Tip: Podés agregar tus stickers, música y texto arriba de la
                imagen.
              </p>
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={generatingImage}
                className="inline-flex items-center justify-center rounded-full bg-pink-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-pink-400 disabled:opacity-60"
              >
                {generatingImage ? "Generando..." : "Descargar PNG"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
