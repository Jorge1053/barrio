// src/app/confesiones/random/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfessionCard from "../../../components/ConfessionCard";

export default function ConfesionesRandomPage() {
  const [confession, setConfession] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState(null);

  async function loadRandom(isInitial = false) {
    setError(null);

    if (isInitial) {
      setInitialLoading(true);
    } else {
      setLoadingNext(true);
    }

    try {
      const res = await fetch("/api/confesiones/random", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Error al cargar confesión aleatoria");

      const data = await res.json();
      setConfession(data.items?.[0] ?? null);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar una confesión. Intenta de nuevo.");
    } finally {
      setInitialLoading(false);
      setLoadingNext(false);
    }
  }

  // Primera carga
  useEffect(() => {
    loadRandom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReact(id, type) {
    const res = await fetch("/api/confesiones/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    if (!res.ok) throw new Error("Error en reacción");

    const { updatedCounts } = await res.json();
    setConfession((prev) =>
      prev && prev.id === id ? { ...prev, ...updatedCounts } : prev
    );
  }

  async function handleReport(id, reason) {
    const res = await fetch("/api/confesiones/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reason }),
    });
    if (!res.ok) throw new Error("Error al reportar");
  }

  const isLoadingAny = initialLoading || loadingNext;

  return (
    <main className="space-y-4">
      {/* HEADER MODO RANDOM */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 space-y-2">
        <h2 className="text-sm font-semibold text-slate-100">
          Modo aleatorio 🎲
        </h2>
        <p className="text-xs text-slate-400">
          Te mostramos una confesión al azar. Podés reaccionar, guardarla en
          favoritos o pedir otra. Ideal para scrollear un rato sin pensar.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => loadRandom(false)}
            disabled={isLoadingAny}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold px-3 py-1.5 text-xs transition-colors disabled:opacity-60"
          >
            {loadingNext || initialLoading
              ? "Cargando..."
              : "Otra confesión 🔁"}
          </button>
          <Link
            href="/confesiones"
            className="inline-flex items-center justify-center rounded-full border border-slate-600 px-3 py-1.5 hover:bg-slate-800 text-xs"
          >
            Volver al feed
          </Link>
        </div>
      </section>

      {/* MENSAJE DE ERROR */}
      {error && (
        <p className="text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* CONTENIDO */}
      <section>
        {initialLoading && !confession && !error && (
          <p className="text-sm text-slate-400">Cargando confesión...</p>
        )}

        {!initialLoading && !confession && !error && (
          <p className="text-sm text-slate-400">
            Por ahora no hay confesiones aprobadas para mostrar. Volvé más tarde
            o sé el primero en{" "}
            <Link href="/confesar" className="text-pink-300 underline">
              confesar algo
            </Link>
            .
          </p>
        )}

        {confession && (
          <ConfessionCard
            confession={confession}
            onReact={handleReact}
            onReport={handleReport}
          />
        )}
      </section>
    </main>
  );
}
