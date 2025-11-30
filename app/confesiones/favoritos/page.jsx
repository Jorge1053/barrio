// src/app/confesiones/favoritos/page.jsx
"use client";

import { useEffect, useState } from "react";
import ConfessionCard from "../../../components/ConfessionCard";

const FAVS_KEY = "confesionario:favs";

export default function FavoritosPage() {
  const [loading, setLoading] = useState(true);
  const [confessions, setConfessions] = useState([]);
  const [error, setError] = useState("");
  const [hasFavIds, setHasFavIds] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const raw = window.localStorage.getItem(FAVS_KEY);
        if (!raw) {
          setHasFavIds(false);
          setConfessions([]);
          return;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setHasFavIds(false);
          setConfessions([]);
          return;
        }

        setHasFavIds(true);

        const res = await fetch("/api/confesiones/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: parsed }),
        });

        if (!res.ok) {
          throw new Error("No se pudieron cargar las confesiones favoritas.");
        }

        const data = await res.json();
        setConfessions(data.items || []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Error inesperado al cargar favoritos.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-100">
          Confesiones guardadas ⭐
        </h2>
        <p className="text-xs text-slate-400">
          Estas son las confesiones que marcaste como favoritas en este
          dispositivo.
        </p>
      </section>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <section className="space-y-3">
        {loading && (
          <p className="text-sm text-slate-400">
            Cargando confesiones favoritas...
          </p>
        )}

        {!loading && !hasFavIds && (
          <p className="text-sm text-slate-400">
            Todavía no tienes confesiones guardadas. Ve al{" "}
            <a href="/confesiones" className="text-pink-300 underline">
              listado principal
            </a>{" "}
            y marca algunas como ⭐ Guardar.
          </p>
        )}

        {!loading && hasFavIds && confessions.length === 0 && (
          <p className="text-sm text-slate-400">
            No se pudieron encontrar las confesiones guardadas (puede que hayan
            sido eliminadas o cambiadas). Vuelve al{" "}
            <a href="/confesiones" className="text-pink-300 underline">
              listado principal
            </a>{" "}
            para guardar nuevas.
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
    </main>
  );
}