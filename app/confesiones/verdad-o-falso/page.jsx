"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function formatRelativeDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VerdadOFalsoPage() {
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [current, setCurrent] = useState(null);
  const [stats, setStats] = useState({ truthVotes: 0, fakeVotes: 0 });
  const [userVote, setUserVote] = useState(null); // "truth" | "fake" | null
  const [error, setError] = useState("");

  const { truthPercent, fakePercent, totalVotes } = useMemo(() => {
    const total = stats.truthVotes + stats.fakeVotes;
    if (!total) return { truthPercent: 0, fakePercent: 0, totalVotes: 0 };
    const truthP = Math.round((stats.truthVotes / total) * 100);
    const fakeP = 100 - truthP;
    return { truthPercent: truthP, fakePercent: fakeP, totalVotes: total };
  }, [stats]);

  async function loadNextConfession(isFirst = false) {
    setError("");
    if (isFirst) {
      setLoading(true);
    } else {
      setLoadingNext(true);
    }

    try {
      const res = await fetch("/api/confesiones/verdad-o-falso/next", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Error al cargar la confesión.");

      const data = await res.json();
      if (!data.item) {
        setCurrent(null);
        setStats({ truthVotes: 0, fakeVotes: 0 });
        setUserVote(null);
        return;
      }

      const item = data.item;
      setCurrent(item);
      setStats({
        truthVotes: item.truth_votes ?? 0,
        fakeVotes: item.fake_votes ?? 0,
      });
      setUserVote(data.userVote ?? null);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error inesperado al cargar la confesión.");
    } finally {
      setLoading(false);
      setLoadingNext(false);
    }
  }

  useEffect(() => {
    loadNextConfession(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVote(vote) {
    if (!current || submittingVote) return;

    setSubmittingVote(true);
    setError("");

    try {
      const res = await fetch("/api/confesiones/verdad-o-falso/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, vote }),
      });

      if (!res.ok) throw new Error("No se pudo registrar tu voto.");

      const data = await res.json();
      const updated = data.updated || {};

      setStats((prev) => ({
        truthVotes:
          typeof updated.truth_votes === "number"
            ? updated.truth_votes
            : prev.truthVotes,
        fakeVotes:
          typeof updated.fake_votes === "number"
            ? updated.fake_votes
            : prev.fakeVotes,
      }));

      setUserVote(data.userVote ?? vote);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error inesperado al votar.");
    } finally {
      setSubmittingVote(false);
    }
  }

  const isVoted = !!userVote;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 pb-10 pt-4">
      {/* HEADER */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-100">
          <span>🎯</span>
          <span>Formato especial · ¿Esto es verdad o falso?</span>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-50">
              Leé la confesión. Votá. Mirá qué piensa el resto.
            </h1>
            <p className="text-sm text-slate-400">
              Algunas historias parecen inventadas. Otras parecen mentira pero
              son reales. Tu misión: decidir si la confesión es{" "}
              <span className="font-semibold text-emerald-300">verdad</span> o{" "}
              <span className="font-semibold text-rose-300">falso</span>.
            </p>
          </div>

          <Link
            href="/confesar"
            className="mt-1 inline-flex items-center justify-center rounded-full border border-pink-400 bg-pink-500/90 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-pink-400 md:mt-0"
          >
            Enviar mi confesión →
          </Link>
        </div>
      </header>

      {/* ESTADO GENERAL */}
      {error && (
        <p className="rounded-2xl border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      )}

      {loading && !current && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-10 text-sm text-slate-300">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          Cargando una confesión que parece mentira…
        </div>
      )}

      {!loading && !current && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-10 text-center text-sm text-slate-300">
          <p>No hay confesiones disponibles en este formato por ahora.</p>
          <p className="mt-1 text-xs text-slate-500">
            Volvé más tarde o envía una historia que parezca mentira desde
            <span> </span>
            <Link href="/confesar" className="text-pink-300 underline">
              /confesar
            </Link>
            .
          </p>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {current && (
        <AnimatePresence mode="wait">
          <motion.section
            key={current.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="rounded-3xl border border-violet-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
          >
            {/* META / BADGE */}
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 font-semibold text-violet-100">
                <span>🧠</span>
                <span>¿Verdad o falso?</span>
              </span>

              {current.category && (
                <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-slate-300">
                  {current.category}
                </span>
              )}

              {current.city && (
                <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-slate-300">
                  {current.city}
                </span>
              )}

              {current.created_at && (
                <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-slate-400">
                  {formatRelativeDate(current.created_at)}
                </span>
              )}
            </div>

            {/* TEXTO CONFESIÓN */}
            <div className="mb-5 rounded-2xl border border-slate-700/70 bg-slate-950/60 px-3 py-3">
              <p className="text-sm leading-relaxed text-slate-50 whitespace-pre-wrap">
                {current.content}
              </p>
            </div>

            {/* CTA VOTAR */}
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleVote("truth")}
                disabled={submittingVote}
                className={`group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  userVote === "truth"
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                    : "border-emerald-500/60 bg-emerald-500/10 text-emerald-50 hover:bg-emerald-500/20"
                } disabled:opacity-60`}
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide">
                    Es verdad
                  </p>
                  <p className="text-xs text-emerald-100/90">
                    Para vos, la historia realmente pasó así.
                  </p>
                </div>
                <span className="text-xl">✅</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote("fake")}
                disabled={submittingVote}
                className={`group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  userVote === "fake"
                    ? "border-rose-400 bg-rose-500/20 text-rose-50"
                    : "border-rose-500/60 bg-rose-500/10 text-rose-50 hover:bg-rose-500/20"
                } disabled:opacity-60`}
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide">
                    Para mí es falso
                  </p>
                  <p className="text-xs text-rose-100/90">
                    Sentís que está exagerada, inventada o no cierra.
                  </p>
                </div>
                <span className="text-xl">❌</span>
              </button>
            </div>

            {/* RESULTADOS */}
            <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-950/80 px-3 py-3">
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                <span>
                  {isVoted
                    ? "Así va la votación:"
                    : "Votá para ver cómo viene la votación."}
                </span>
                <span className="text-slate-400">
                  {totalVotes === 0
                    ? "Sin votos todavía"
                    : `${totalVotes} voto${
                        totalVotes === 1 ? "" : "s"
                      } en total`}
                </span>
              </div>

              {/* Barra de porcentajes */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                  style={{
                    width: `${truthPercent}%`,
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-400 to-rose-500 transition-all"
                  style={{
                    width: `${fakePercent}%`,
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Verdad: {truthPercent}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-100">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>Falso: {fakePercent}%</span>
                  </span>
                </div>

                {userVote && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-200">
                    <span>Tu voto:</span>
                    <span className="font-semibold">
                      {userVote === "truth" ? "Es verdad" : "Es falso"}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* ACCIONES INFERIORES */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => loadNextConfession(false)}
                disabled={loadingNext}
                className="inline-flex items-center justify-center rounded-full border border-violet-400 bg-violet-500/20 px-4 py-1.5 font-semibold text-violet-50 hover:bg-violet-500/30 disabled:opacity-60"
              >
                {loadingNext
                  ? "Trayendo otra historia..."
                  : "Siguiente confesión →"}
              </button>

              <p className="text-[10px] text-slate-500">
                Todo es anónimo. Si una confesión rompe las reglas, podés
                reportarla desde la vista normal de{" "}
                <Link
                  href={`/confesiones/${current.id}`}
                  className="text-pink-300 underline"
                >
                  confesiones
                </Link>
                .
              </p>
            </div>
          </motion.section>
        </AnimatePresence>
      )}
    </main>
  );
}