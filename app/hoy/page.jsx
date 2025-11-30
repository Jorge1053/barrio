// src/app/hoy/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfessionCard from "../../components/ConfessionCard";

export default function HoyPage() {
  const [prompt, setPrompt] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [confessions, setConfessions] = useState([]);
  const [loadingConfessions, setLoadingConfessions] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      setLoadingPrompt(true);
      try {
        const res = await fetch("/api/prompts/today");
        if (!res.ok) throw new Error("Error al obtener la pregunta del día");
        const data = await res.json();
        setPrompt(data.prompt || null);
      } catch (e) {
        console.error(e);
        setPrompt(null);
      } finally {
        setLoadingPrompt(false);
      }
    };

    loadPrompt();
  }, []);

  useEffect(() => {
    const loadConfessions = async () => {
      if (!prompt?.id) return;
      setLoadingConfessions(true);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("city", "todos");
        params.set("category", "todos");
        params.set("sort", "new");
        params.set("prompt_id", prompt.id);

        const res = await fetch(`/api/confesiones/list?${params.toString()}`);
        if (!res.ok) throw new Error("Error al cargar confesiones");
        const data = await res.json();
        setConfessions(data.items ?? []);
      } catch (e) {
        console.error(e);
        setConfessions([]);
      } finally {
        setLoadingConfessions(false);
      }
    };

    loadConfessions();
  }, [prompt?.id]);

  async function handleReact(id, type) {
    const res = await fetch("/api/confesiones/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    if (!res.ok) throw new Error("Error en reacción");
    const { updatedCounts } = await res.json();
    setConfessions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedCounts } : c))
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

  return (
    <main className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 space-y-2">
        {loadingPrompt && (
          <>
            <div className="h-4 w-40 rounded bg-slate-800 animate-pulse" />
            <div className="h-3 w-64 rounded bg-slate-800 animate-pulse" />
          </>
        )}

        {!loadingPrompt && !prompt && (
          <>
            <h2 className="text-sm font-semibold text-slate-100">
              Pregunta del día
            </h2>
            <p className="text-xs text-slate-400">
              Hoy todavía no hay una pregunta activa. Volvé más tarde o explorá
              el feed general de confesiones.
            </p>
            <Link
              href="/confesiones"
              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800"
            >
              Ir a las confesiones
            </Link>
          </>
        )}

        {!loadingPrompt && prompt && (
          <>
            <h2 className="text-sm font-semibold text-slate-100">
              Pregunta del día
            </h2>
            <p className="text-base text-slate-50 font-medium">
              {prompt.title}
            </p>
            {prompt.description && (
              <p className="text-xs text-slate-400">{prompt.description}</p>
            )}

            <div className="flex flex-wrap gap-2 text-xs mt-2">
              <Link
                href={`/confesar?prompt_id=${prompt.id}`}
                className="inline-flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold px-3 py-1.5 transition-colors"
              >
                Confesar sobre esto
              </Link>
              <Link
                href="/confesiones"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-3 py-1.5 hover:bg-slate-800"
              >
                Ver todas las confesiones
              </Link>
            </div>
          </>
        )}
      </section>

      {prompt && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Confesiones de hoy
          </h3>

          {loadingConfessions && (
            <p className="text-sm text-slate-400">Cargando confesiones...</p>
          )}

          {!loadingConfessions && confessions.length === 0 && (
            <p className="text-sm text-slate-400">
              Nadie ha confesado todavía sobre esta pregunta. Sé el primero en{" "}
              <Link
                href={`/confesar?prompt_id=${prompt?.id}`}
                className="text-pink-300 underline"
              >
                responderla
              </Link>
              .
            </p>
          )}

          {confessions.map((conf) => (
            <ConfessionCard
              key={conf.id}
              confession={conf}
              onReact={handleReact}
              onReport={handleReport}
            />
          ))}
        </section>
      )}
    </main>
  );
}
