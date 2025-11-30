// src/app/admin/confesiones/page.jsx
"use client";

import { useState } from "react";

export default function AdminConfesionesPage() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  async function fetchData(currentStatus = statusFilter) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", currentStatus);
      const res = await fetch(`/api/admin/confesiones?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("No autorizado o error");
      }
      const data = await res.json();
      setItems(data.items || []);
      setAuthed(true);
    } catch (e) {
      console.error(e);
      setError(e.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateConfession(id, action) {
    if (!window.confirm(`¿Seguro que quieres ${action} esta confesión?`))
      return;
    try {
      const res = await fetch("/api/admin/confesiones", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Error");
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar.");
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!token) return;
    fetchData("pending");
  }

  if (!authed) {
    return (
      <main className="max-w-md mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Admin · Moderación de confesiones
        </h2>
        <p className="text-sm text-slate-400">
          Ingresa el token de administración para moderar confesiones.
        </p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_API_TOKEN"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Moderación de confesiones
          </h2>
          <p className="text-xs text-slate-400">
            Revisa contenido, aprueba lo que cumpla las reglas y elimina lo que
            pueda dañar a alguien.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            className="bg-slate-950 border border-slate-700 rounded-full px-3 py-1 text-xs"
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              fetchData(val);
            }}
          >
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="all">Todas</option>
          </select>
          <button
            type="button"
            onClick={() => fetchData(statusFilter)}
            className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700"
          >
            Refrescar
          </button>
        </div>
      </header>

      <section className="space-y-3">
        {loading && <p className="text-sm text-slate-400">Cargando...</p>}
        {items.length === 0 && !loading && (
          <p className="text-sm text-slate-400">
            No hay confesiones en este estado.
          </p>
        )}
        {items.map((c) => (
          <article
            key={c.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>
                {c.city}
                {c.university ? ` · ${c.university}` : ""} · {c.category}
                {c.intention && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                    {c.intention === "advice" && "🧠 Consejo"}
                    {c.intention === "vent" && "💭 Desahogo"}
                    {c.intention === "story" && "📖 Historia"}
                  </span>
                )}
              </span>
              <span>{new Date(c.created_at).toLocaleString("es-AR")}</span>
            </div>
            <p className="text-slate-100 whitespace-pre-wrap mb-3">
              {c.content}
            </p>

            {c.is_truth_or_fake && (
              <p className="mb-2 text-[11px] text-slate-400">
                🎯 En juego "¿Verdad o falso?" · ✅ {c.truth_votes ?? 0} · ❌{" "}
                {c.fake_votes ?? 0}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {c.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => updateConfession(c.id, "approve")}
                  className="px-3 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-medium"
                >
                  Aprobar
                </button>
              )}
              {c.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => updateConfession(c.id, "reject")}
                  className="px-3 py-1 rounded-full bg-yellow-500/90 hover:bg-yellow-400 text-slate-950 font-medium"
                >
                  Rechazar
                </button>
              )}

              {!c.is_truth_or_fake && c.status === "approved" && (
                <button
                  type="button"
                  onClick={() => updateConfession(c.id, "add_truth_or_fake")}
                  className="px-3 py-1 rounded-full bg-violet-500/90 hover:bg-violet-400 text-slate-950 font-medium"
                >
                  Añadir a "¿Verdad o falso?"
                </button>
              )}
              {c.is_truth_or_fake && (
                <button
                  type="button"
                  onClick={() => updateConfession(c.id, "remove_truth_or_fake")}
                  className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-100"
                >
                  Quitar de "¿Verdad o falso?"
                </button>
              )}

              <button
                type="button"
                onClick={() => updateConfession(c.id, "delete")}
                className="px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-slate-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
