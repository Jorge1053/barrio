// src/app/confesiones/page.jsx
"use client";

import { useEffect, useState } from "react";
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

      const res = await fetch(`/api/confesiones/list?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar confesiones");

      const data = await res.json();
      setHasMore(data.hasMore);
      setPage(pageToLoad);
      setConfessions((prev) =>
        replace ? data.items : [...prev, ...data.items]
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
    <main className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Explora confesiones
          </h2>
          <p className="text-xs text-slate-400">
            Filtra por ciudad, tema y orden. Todo anónimo, sin nombres ni datos
            personales.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <select
            className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1"
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
            className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1"
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
            className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1"
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

      <section className="space-y-3">
        {confessions.length === 0 && !loading && (
          <p className="text-sm text-slate-400">
            Todavía no hay confesiones para estos filtros. Sé la primera persona
            en{" "}
            <a href="/confesar" className="text-pink-300 underline">
              confesar algo
            </a>
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
