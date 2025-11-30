// src/app/admin/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";

const CONF_STATUS_LABELS = {
  pending: "Pendientes",
  approved: "Aprobadas",
  rejected: "Rechazadas",
  all: "Todas",
};

export default function AdminDashboardPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("confessions"); // "confessions" | "reports"

  // Confesiones
  const [confStatusFilter, setConfStatusFilter] = useState("pending");
  const [confLoading, setConfLoading] = useState(false);
  const [confessions, setConfessions] = useState([]);
  const [showOnlyTruthOrFake, setShowOnlyTruthOrFake] = useState(false);

  // Reportes
  const [reportsHandledFilter, setReportsHandledFilter] = useState("unhandled"); // "unhandled" | "all"
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reports, setReports] = useState([]);

  // ---- AUTH ----
  async function handleLogin(e) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      setConfLoading(true);
      const res = await fetch(`/api/admin/confesiones?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Token inválido o error de servidor.");
      const data = await res.json();
      setConfessions(data.items || []);
      setAuthed(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al autenticar.");
      setAuthed(false);
    } finally {
      setConfLoading(false);
    }
  }

  // ---- CONFESIONES ----
  async function fetchConfessions(status = confStatusFilter) {
    if (!token) return;
    setConfLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      const res = await fetch(`/api/admin/confesiones?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar confesiones.");
      const data = await res.json();
      setConfessions(data.items || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando confesiones.");
    } finally {
      setConfLoading(false);
    }
  }

  async function handleConfessionAction(id, action) {
    let msg = "";
    if (action === "approve") msg = "aprobar esta confesión";
    if (action === "reject") msg = "rechazar esta confesión";
    if (action === "delete") msg = "ELIMINAR definitivamente esta confesión";
    if (action === "add_truth_or_fake")
      msg = 'añadirla al formato "¿Esto es verdad o falso?"';
    if (action === "remove_truth_or_fake")
      msg = 'quitarla del formato "¿Esto es verdad o falso?"';

    if (!window.confirm(`¿Seguro que quieres ${msg}?`)) return;

    try {
      const res = await fetch("/api/admin/confesiones", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Error al actualizar confesión.");
      await fetchConfessions();
      await fetchReports(reportsHandledFilter);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la confesión.");
    }
  }

  // ---- REPORTES ----
  async function fetchReports(filter = reportsHandledFilter) {
    if (!token) return;
    setReportsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter === "unhandled") params.set("handled", "false");
      const res = await fetch(`/api/admin/reportes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar reportes.");
      const data = await res.json();
      setReports(data.items || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando reportes.");
    } finally {
      setReportsLoading(false);
    }
  }

  async function handleReportAction(reportId, action, confessionId) {
    // action: "mark_handled" | "mark_unhandled" | "delete_confession"
    let msg = "";
    if (action === "mark_handled") msg = "marcar este reporte como gestionado";
    if (action === "mark_unhandled") msg = "marcar este reporte como pendiente";
    if (action === "delete_confession")
      msg = "ELIMINAR la confesión y todos sus reportes";

    if (!window.confirm(`¿Seguro que quieres ${msg}?`)) return;

    try {
      const res = await fetch("/api/admin/reportes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId, action, confessionId }),
      });
      if (!res.ok) throw new Error("Error al actualizar reporte.");
      await fetchReports();
      if (action === "delete_confession") {
        await fetchConfessions();
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el reporte.");
    }
  }

  // Si ya está autenticado y se cambia de pestaña/filtros, cargamos datos
  useEffect(() => {
    if (!authed) return;
    if (activeTab === "confessions") {
      fetchConfessions(confStatusFilter);
    } else if (activeTab === "reports") {
      fetchReports(reportsHandledFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, activeTab]);

  useEffect(() => {
    if (!authed) return;
    fetchConfessions(confStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confStatusFilter]);

  useEffect(() => {
    if (!authed) return;
    fetchReports(reportsHandledFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsHandledFilter]);

  const filteredConfessions = useMemo(() => {
    if (!showOnlyTruthOrFake) return confessions;
    return confessions.filter((c) => c.is_truth_or_fake);
  }, [confessions, showOnlyTruthOrFake]);

  // ---------- UI LOGIN ----------
  if (!authed) {
    return (
      <main className="max-w-md mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Panel admin · Confesiones
        </h2>
        <p className="text-sm text-slate-400">
          Ingresa el token de administración para moderar confesiones y manejar
          reportes.
        </p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="PASSWORD"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
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

  // ---------- UI DASHBOARD ----------
  return (
    <main className="grid gap-6 md:grid-cols-[260px,1fr]">
      {/* SIDEBAR */}
      <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Panel de moderación
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Gestioná confesiones, reportes y el juego de{" "}
            <span className="font-semibold text-pink-300">
              ¿Verdad o falso?
            </span>
          </p>
        </div>

        {/* Tabs principales */}
        <div className="flex gap-2 rounded-2xl bg-slate-900/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("confessions")}
            className={`flex-1 rounded-xl px-3 py-1.5 font-medium ${
              activeTab === "confessions"
                ? "bg-pink-500 text-slate-950"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            Confesiones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex-1 rounded-xl px-3 py-1.5 font-medium ${
              activeTab === "reports"
                ? "bg-pink-500 text-slate-950"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            Reportes
          </button>
        </div>

        {/* Filtros de confesiones */}
        {activeTab === "confessions" && (
          <div className="space-y-3 text-xs">
            <div>
              <p className="mb-1 text-[11px] font-semibold text-slate-300">
                Estado de confesiones
              </p>
              <div className="space-y-1">
                {["pending", "approved", "rejected", "all"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setConfStatusFilter(status)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 ${
                      confStatusFilter === status
                        ? "bg-slate-800 text-slate-50"
                        : "text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <span>{CONF_STATUS_LABELS[status]}</span>
                    {confStatusFilter === status && (
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-300">
                Juego "¿Verdad o falso?"
              </p>
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={showOnlyTruthOrFake}
                  onChange={(e) => setShowOnlyTruthOrFake(e.target.checked)}
                  className="h-3 w-3 rounded border-slate-600 bg-slate-950 text-pink-500"
                />
                <span>Mostrar solo confesiones en el juego VF</span>
              </label>
              <p className="text-[10px] text-slate-500">
                Igual podés añadir o quitar cada confesión al juego desde la
                lista.
              </p>
            </div>
          </div>
        )}

        {/* Filtros de reportes */}
        {activeTab === "reports" && (
          <div className="space-y-3 text-xs">
            <p className="text-[11px] font-semibold text-slate-300">
              Estado de reportes
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setReportsHandledFilter("unhandled")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 ${
                  reportsHandledFilter === "unhandled"
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <span>Pendientes</span>
                {reportsHandledFilter === "unhandled" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setReportsHandledFilter("all")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 ${
                  reportsHandledFilter === "all"
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <span>Todos</span>
                {reportsHandledFilter === "all" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                )}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section className="space-y-6">
        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* --------- TAB CONFESIONES --------- */}
        {activeTab === "confessions" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Mostrando:{" "}
                <span className="font-semibold text-slate-200">
                  {CONF_STATUS_LABELS[confStatusFilter]}
                </span>
                {showOnlyTruthOrFake && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-200">
                    🎯 Solo en "¿Verdad o falso?"
                  </span>
                )}
              </div>
              <div className="inline-flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fetchConfessions(confStatusFilter)}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs"
                >
                  Refrescar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {confLoading && (
                <p className="text-sm text-slate-400">
                  Cargando confesiones...
                </p>
              )}
              {!confLoading && filteredConfessions.length === 0 && (
                <p className="text-sm text-slate-400">
                  No hay confesiones para este filtro.
                </p>
              )}
              {filteredConfessions.map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mb-2">
                    <span>
                      {c.city}
                      {c.university ? ` · ${c.university}` : ""} ·{" "}
                      <span className="uppercase">{c.category}</span>
                      {c.intention && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                          {c.intention === "advice" && "🧠 Consejo"}
                          {c.intention === "vent" && "💭 Desahogo"}
                          {c.intention === "story" && "📖 Historia"}
                        </span>
                      )}
                    </span>
                    <span>
                      {new Date(c.created_at).toLocaleString("es-AR")}
                    </span>
                  </div>

                  <p className="text-slate-100 whitespace-pre-wrap mb-3">
                    {c.content}
                  </p>

                  {/* Reacciones + estado + badge VF */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mb-2">
                    <span>
                      ❤️ {c.likes_count} · 😮 {c.wow_count} · 😂 {c.haha_count}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {c.is_truth_or_fake && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold text-violet-200">
                          <span>🎯</span>
                          <span>¿Verdad o falso?</span>
                        </span>
                      )}
                      <span>
                        Estado:{" "}
                        <span
                          className={
                            c.status === "approved"
                              ? "text-emerald-400"
                              : c.status === "rejected"
                              ? "text-yellow-400"
                              : "text-sky-400"
                          }
                        >
                          {CONF_STATUS_LABELS[c.status] || c.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Stats de votos VF si aplica */}
                  {c.is_truth_or_fake && (
                    <p className="mb-2 text-[11px] text-slate-400">
                      Votos VF: ✅ {c.truth_votes ?? 0} · ❌ {c.fake_votes ?? 0}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs">
                    {c.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleConfessionAction(c.id, "approve")}
                        className="px-3 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-medium"
                      >
                        Aprobar
                      </button>
                    )}
                    {c.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleConfessionAction(c.id, "reject")}
                        className="px-3 py-1 rounded-full bg-yellow-500/90 hover:bg-yellow-400 text-slate-950 font-medium"
                      >
                        Rechazar
                      </button>
                    )}

                    {/* Botones para el formato "¿Verdad o falso?" */}
                    {c.status === "approved" && !c.is_truth_or_fake && (
                      <button
                        type="button"
                        onClick={() =>
                          handleConfessionAction(c.id, "add_truth_or_fake")
                        }
                        className="px-3 py-1 rounded-full bg-violet-500/90 hover:bg-violet-400 text-slate-950 font-medium"
                      >
                        Añadir a "¿Verdad o falso?"
                      </button>
                    )}
                    {c.is_truth_or_fake && (
                      <button
                        type="button"
                        onClick={() =>
                          handleConfessionAction(c.id, "remove_truth_or_fake")
                        }
                        className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-100"
                      >
                        Quitar de "¿Verdad o falso?"
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleConfessionAction(c.id, "delete")}
                      className="px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-slate-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* --------- TAB REPORTES --------- */}
        {activeTab === "reports" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Mostrando:{" "}
                <span className="font-semibold text-slate-200">
                  {reportsHandledFilter === "unhandled"
                    ? "Reportes pendientes"
                    : "Todos los reportes"}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fetchReports(reportsHandledFilter)}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs"
                >
                  Refrescar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {reportsLoading && (
                <p className="text-sm text-slate-400">Cargando reportes...</p>
              )}
              {!reportsLoading && reports.length === 0 && (
                <p className="text-sm text-slate-400">
                  No hay reportes para este filtro.
                </p>
              )}
              {reports.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>
                      Reporte ·{" "}
                      {r.handled ? (
                        <span className="text-emerald-400 font-medium">
                          Gestionado
                        </span>
                      ) : (
                        <span className="text-yellow-400 font-medium">
                          Pendiente
                        </span>
                      )}
                    </span>
                    <span>
                      {new Date(r.created_at).toLocaleString("es-AR")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Motivo del reporte:{" "}
                    <span className="text-slate-100">{r.reason}</span>
                  </p>

                  {r.confession ? (
                    <div className="mt-2 rounded-lg bg-slate-950/60 border border-slate-800 p-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>
                          {r.confession.city}
                          {r.confession.university
                            ? ` · ${r.confession.university}`
                            : ""}{" "}
                          · {r.confession.category}
                        </span>
                        <span>
                          {new Date(r.confession.created_at).toLocaleString(
                            "es-AR"
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-100 whitespace-pre-wrap mb-1">
                        {r.confession.content.length > 300
                          ? r.confession.content.slice(0, 300) + "..."
                          : r.confession.content}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Estado actual:{" "}
                        <span
                          className={
                            r.confession.status === "approved"
                              ? "text-emerald-400"
                              : r.confession.status === "rejected"
                              ? "text-yellow-400"
                              : "text-sky-400"
                          }
                        >
                          {CONF_STATUS_LABELS[r.confession.status] ||
                            r.confession.status}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2">
                      La confesión asociada ya no existe (fue eliminada).
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {!r.handled && (
                      <button
                        type="button"
                        onClick={() =>
                          handleReportAction(
                            r.id,
                            "mark_handled",
                            r.confession?.id
                          )
                        }
                        className="px-3 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-medium"
                      >
                        Marcar gestionado
                      </button>
                    )}
                    {r.handled && (
                      <button
                        type="button"
                        onClick={() =>
                          handleReportAction(
                            r.id,
                            "mark_unhandled",
                            r.confession?.id
                          )
                        }
                        className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-100"
                      >
                        Volver a pendiente
                      </button>
                    )}
                    {r.confession && (
                      <button
                        type="button"
                        onClick={() =>
                          handleReportAction(
                            r.id,
                            "delete_confession",
                            r.confession.id
                          )
                        }
                        className="px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-slate-50"
                      >
                        Eliminar confesión
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
