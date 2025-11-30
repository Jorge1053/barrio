// src/app/confesiones/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ConfessionCard from "../../components/ConfessionCard";

const CITIES = [
  "Buenos Aires",
  "Córdoba",
  "Rosario",
  "Mendoza",
  "La Plata",
  "Otras",
];

const CATEGORIES = [
  { value: "todos", label: "Todas" },
  { value: "amor", label: "Amor" },
  { value: "estudio", label: "Estudio" },
  { value: "familia", label: "Familia" },
  { value: "trabajo", label: "Trabajo" },
  { value: "plata", label: "Plata" },
  { value: "random", label: "Random" },
];

const SORTS = [
  { value: "new", label: "Más recientes" },
  { value: "top", label: "Más reacciones" },
];

const INTENTIONS = [
  { value: "todos", label: "Todos los modos" },
  { value: "advice", label: "Necesitan consejo" },
  { value: "vent", label: "Solo desahogo" },
  { value: "story", label: "Historias random" },
];

const intentionLabels = {
  advice: "Buscando consejo",
  vent: "Necesita desahogarse",
  story: "Historia para compartir",
};

// --- helpers fechas ---

function getDateKey(created_at) {
  if (!created_at) return "sin-fecha";
  const d = new Date(created_at);
  if (Number.isNaN(d.getTime())) return "sin-fecha";
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(key) {
  if (key === "sin-fecha") return "Sin fecha";

  const d = new Date(key + "T00:00:00");

  if (Number.isNaN(d.getTime())) return "Sin fecha";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const compare = (a, b) => a.getTime() === b.getTime();

  if (compare(d, today)) return "Hoy";
  if (compare(d, yesterday)) return "Ayer";

  const formatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  // ej: "martes 25 nov"
  let label = formatter.format(d);
  label = label.charAt(0).toUpperCase() + label.slice(1);
  return label;
}

export default function ConfesionesPage() {
  const [loading, setLoading] = useState(true);
  const [confessions, setConfessions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    city: "todos",
    category: "todos",
    sort: "new",
    intention: "todos",
  });

  // Frase del día
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const res = await fetch("/api/confesiones/quote-of-day", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Error frase del día");
        const data = await res.json();
        setQuote(data.item || null);
      } catch (e) {
        console.error(e);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    loadQuote();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchConfessions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.category, filters.sort, filters.intention]);

  async function fetchConfessions(pageToLoad = 1, replace = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageToLoad.toString());
      params.set("city", filters.city);
      params.set("category", filters.category);
      params.set("sort", filters.sort);
      params.set("intention", filters.intention);

      const res = await fetch(`/api/confesiones/list?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Error al cargar confesiones");

      const data = await res.json();
      setHasMore(data.hasMore);
      setPage(pageToLoad);
      setConfessions((prev) =>
        replace ? data.items : [...prev, ...(data.items || [])]
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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

  const quoteText = quote?.content
    ? quote.content.length > 200
      ? `${quote.content.slice(0, 200).trim()}…`
      : quote.content.trim()
    : null;

  const quoteIntentionLabel = quote?.intention
    ? intentionLabels[quote.intention]
    : null;

  // --- Agrupar confesiones por fecha (timeline) ---

  const groupedByDate = useMemo(() => {
    if (!confessions || confessions.length === 0) return [];

    const groups = new Map();

    for (const conf of confessions) {
      const key = getDateKey(conf.created_at);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(conf);
    }

    // Ordenar cada grupo por fecha desc (por si la API no viene perfecta)
    const entries = Array.from(groups.entries()).map(([key, items]) => ({
      key,
      items: items.slice().sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      }),
    }));

    // "sin-fecha" al final, el resto por fecha desc
    return entries.sort((a, b) => {
      if (a.key === "sin-fecha") return 1;
      if (b.key === "sin-fecha") return -1;
      return a.key < b.key ? 1 : -1; // más reciente primero
    });
  }, [confessions]);

  return (
    <main className="space-y-5">
      {/* FRASE DEL DÍA */}
      {!quoteLoading && quote && quoteText && (
        <section className="rounded-2xl border border-pink-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-4 shadow-lg shadow-black/40">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 md:max-w-[70%]">
              <p className="inline-flex items-center gap-1 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-pink-200">
                Frase del día
              </p>
              <p className="text-sm leading-relaxed text-slate-50 whitespace-pre-wrap break-words">
                “{quoteText}”
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                {quote?.city && (
                  <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5">
                    {quote.city}
                  </span>
                )}
                {quoteIntentionLabel && (
                  <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5">
                    {quoteIntentionLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-col items-end justify-between md:mt-0">
              <Link
                href={`/confesiones/${quote.id}`}
                className="rounded-full border border-pink-400 bg-pink-500/90 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-pink-400"
              >
                Ver confesión completa →
              </Link>
              <p className="mt-2 text-[10px] text-slate-500 md:mt-4">
                Todo es anónimo. Sin nombres, sin datos personales.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FEATURE CARDS */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Random */}
        <Link
          href="/confesiones/random"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Modo aleatorio
            </p>
            <h2 className="flex items-center gap-1 text-sm font-semibold text-slate-100">
              Confesión al azar
            </h2>
            <p className="text-xs text-slate-400">
              Leé una confesión random, reaccioná y pedí otra. Ideal para
              scrollear un rato.
            </p>
            <span className="mt-2 inline-flex items-center text-[11px] font-medium text-pink-300 group-hover:text-pink-200">
              Probar ahora →
            </span>
          </div>
          <div className="shrink-0">
            <Image
              src="/confesiones-random.svg"
              alt="Modo aleatorio"
              width={96}
              height={96}
              className="h-16 w-16 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] md:h-20 md:w-20"
            />
          </div>
        </Link>

        {/* Hoy */}
        <Link
          href="/hoy"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pregunta del día
            </p>
            <h2 className="flex items-center gap-1 text-sm font-semibold text-slate-100">
              Hoy, ¿de qué hablamos?
            </h2>
            <p className="text-xs text-slate-400">
              Una consigna distinta cada día para confesar sobre un mismo tema.
            </p>
            <span className="mt-2 inline-flex items-center text-[11px] font-medium text-pink-300 group-hover:text-pink-200">
              Ver pregunta del día →
            </span>
          </div>
          <div className="shrink-0">
            <Image
              src="/confesiones-hoy.svg"
              alt="Pregunta del día"
              width={96}
              height={96}
              className="h-16 w-16 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] md:h-20 md:w-20"
            />
          </div>
        </Link>

        {/* Favoritos */}
        <Link
          href="/confesiones/favoritos"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/5 px-4 py-3"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300/80">
              Tu colección
            </p>
            <h2 className="flex items-center gap-1 text-sm font-semibold text-amber-100">
              Confesiones favoritas
            </h2>
            <p className="text-xs text-amber-200/80">
              Guardá confesiones que te marcaron y volvé a leerlas cuando
              quieras.
            </p>
            <span className="mt-2 inline-flex items-center text-[11px] font-medium text-amber-200 group-hover:text-amber-100">
              Ver mis favoritas →
            </span>
          </div>
          <div className="shrink-0">
            <Image
              src="/confesiones-favs.svg"
              alt="Confesiones favoritas"
              width={96}
              height={96}
              className="h-16 w-16 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] md:h-20 md:w-20"
            />
          </div>
        </Link>
      </section>

      {/* FILTROS */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 md:px-4 md:py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Explorá confesiones
          </h2>
          <p className="text-xs text-slate-400">
            Filtrá por ciudad, tema, modo y orden. Todo anónimo, sin nombres ni
            datos personales.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          {/* Ciudad / categoría / orden */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              className="w-full rounded-full border border-slate-700 bg-slate-950 px-3 py-1 sm:w-auto"
              value={filters.city}
              onChange={(e) =>
                setFilters((f) => ({ ...f, city: e.target.value }))
              }
            >
              <option value="todos">Todas las ciudades</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-full border border-slate-700 bg-slate-950 px-3 py-1 sm:w-auto"
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-full border border-slate-700 bg-slate-950 px-3 py-1 sm:w-auto"
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sort: e.target.value }))
              }
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Intención */}
          <div className="flex flex-wrap gap-2 pt-1">
            {INTENTIONS.map((int) => {
              const active = filters.intention === int.value;
              return (
                <button
                  key={int.value}
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({ ...f, intention: int.value }))
                  }
                  className={`rounded-full px-3 py-1 transition-colors ${
                    active
                      ? "border-pink-400 bg-pink-500/20 text-pink-100"
                      : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-pink-400/60"
                  }`}
                >
                  {int.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* LISTADO CON TIMELINE DE FECHAS */}
      <section className="space-y-4">
        {confessions.length === 0 && !loading && (
          <p className="text-sm text-slate-400">
            Todavía no hay confesiones para estos filtros. Sé la primera persona
            en{" "}
            <Link href="/confesar" className="text-pink-300 underline">
              confesar algo
            </Link>
            .
          </p>
        )}

        {groupedByDate.map((group) => {
          const label = formatDateLabel(group.key);
          const count = group.items.length;
          return (
            <div key={group.key} className="space-y-2">
              {/* Cabecera de fecha tipo timeline */}
              <div className="sticky top-[64px] z-10 flex items-center gap-3 bg-slate-950/85 py-1 backdrop-blur">
                <div className="relative flex items-center gap-2">
                  {/* Línea + punto (timeline vertical) */}
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-px bg-slate-700/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]" />
                  </div>
                  <div className="h-4 w-px bg-slate-700/60" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1">
                  <span className="text-[11px] font-semibold text-slate-100">
                    {label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {count === 1 ? "1 confesión" : `${count} confesiones`}
                  </span>
                </div>
              </div>

              {/* Confesiones de ese día */}
              <div className="space-y-3">
                {group.items.map((conf) => (
                  <ConfessionCard
                    key={conf.id}
                    confession={conf}
                    onReact={handleReact}
                    onReport={handleReport}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex justify-center pt-2">
          {hasMore && (
            <button
              type="button"
              onClick={() => fetchConfessions(page + 1)}
              disabled={loading}
              className="rounded-full bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Cargar más"}
            </button>
          )}
        </div>

        {loading && confessions.length === 0 && (
          <p className="text-sm text-slate-400">Cargando confesiones...</p>
        )}
      </section>
    </main>
  );
}