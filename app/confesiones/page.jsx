// src/app/confesiones/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function ConfesionesPage() {
  const [loading, setLoading] = useState(true);
  const [confessions, setConfessions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    city: "todos",
    category: "todos",
    sort: "new",
  });

  useEffect(() => {
    setPage(1);
    fetchConfessions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.category, filters.sort]);

  async function fetchConfessions(pageToLoad = 1, replace = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageToLoad.toString());
      params.set("city", filters.city);
      params.set("category", filters.category);
      params.set("sort", filters.sort);

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

  return (
    <main className="space-y-5">
      {/* FEATURE CARDS */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Link
          href="/confesiones/random"
          className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Modo aleatorio
            </p>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1">
              🎲 Confesión al azar
            </h2>
            <p className="text-xs text-slate-400">
              Leé una confesión random, reaccioná y pedí otra. Ideal para
              scrollear un rato.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center text-[11px] font-medium text-pink-300 group-hover:text-pink-200">
            Probar ahora →
          </span>
        </Link>

        <Link
          href="/hoy"
          className="group rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pregunta del día
            </p>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1">
              🗓️ Hoy, ¿de qué hablamos?
            </h2>
            <p className="text-xs text-slate-400">
              Una consigna distinta cada día para confesar sobre un mismo tema.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center text-[11px] font-medium text-pink-300 group-hover:text-pink-200">
            Ver pregunta del día →
          </span>
        </Link>

        <Link
          href="/confesiones/favoritos"
          className="group rounded-2xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300/80">
              Tu colección
            </p>
            <h2 className="text-sm font-semibold text-amber-100 flex items-center gap-1">
              ⭐ Confesiones favoritas
            </h2>
            <p className="text-xs text-amber-200/80">
              Guarda confesiones que te marcaron y volvé a leerlas cuando
              quieras.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center text-[11px] font-medium text-amber-200 group-hover:text-amber-100">
            Ver mis favoritas →
          </span>
        </Link>
      </section>

      {/* FILTROS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 md:px-4 md:py-3 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Explora confesiones
          </h2>
          <p className="text-xs text-slate-400">
            Filtrá por ciudad, tema y orden. Todo anónimo, sin nombres ni datos
            personales.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center">
          {/* Ciudad */}
          <select
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-full px-3 py-1"
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

          {/* Categoría */}
          <select
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-full px-3 py-1"
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

          {/* Orden */}
          <select
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-full px-3 py-1"
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
      </section>

      {/* LISTADO */}
      <section className="space-y-3">
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

        {confessions.map((conf) => (
          <ConfessionCard
            key={conf.id}
            confession={conf}
            onReact={handleReact}
            onReport={handleReport}
          />
        ))}

        <div className="flex justify-center pt-2">
          {hasMore && (
            <button
              type="button"
              onClick={() => fetchConfessions(page + 1)}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
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
